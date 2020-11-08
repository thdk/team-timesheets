import React from "react";
import { initTestFirestore, deleteFirebaseAppsAsync } from "../../../__tests__/utils/firebase";
import { Store } from "../../../stores/root-store";
import { TestCollection } from "../../../__tests__/utils/firestorable/collection";
import { IProjectData } from "../../../../common";
import { ActiveProjectList } from ".";
import { render, waitFor, fireEvent } from "@testing-library/react";
import { canEditProject } from "../../../rules";
import { act } from "react-dom/test-utils";
const {
    firestore,
    clearFirestoreDataAsync,
    refs: [
        projectRef,
    ]
} = initTestFirestore("project-list-active-test",
    [
        "projects",
    ]);

const store = new Store({
    firestore,
});

jest.mock("../../../contexts/store-context", () => ({
    useStore: () => store,
}));

jest.mock("../../../internal", () => ({
    GoToProject: () => "GoToProject",
}));

jest.mock("../../../rules");

const projectsCollection = new TestCollection<IProjectData>(firestore, projectRef);

beforeAll(clearFirestoreDataAsync);
afterAll(() => {
    store.dispose();
    return Promise.all([
        deleteFirebaseAppsAsync(),
    ])
});

describe("ProjectListActive", () => {

    it("renders without projects", () => {
        const { asFragment } = render(<ActiveProjectList />);

        expect(asFragment()).toMatchSnapshot();
    });

    it("displays active projects", async () => {
        const projectIds = await projectsCollection.addAsync([
            {
                name: "Project 1",
                name_insensitive: "PROJECT 1",
                icon: "people",
                createdBy: "user-1",
            },
        ]);

        const { getByText, queryByText } = render(<ActiveProjectList />);
        await waitFor(() => getByText("Project 1"));

        await act(async () => {
            await projectsCollection.updateAsync({
                isArchived: true,
            }, ...projectIds);
        });

        await waitFor(() => expect(queryByText("Project 1")).toBeNull());

        await act(async () => {
            await projectsCollection.updateAsync({
                isArchived: false,
            }, ...projectIds);
        });

        await waitFor(() => getByText("Project 1"));

        act(() => {
            store.projects.deleteProjects(...projectIds);
        });

        await waitFor(() => expect(queryByText("Project 1")).toBeNull());
    });

    it("allow to select multiple projects", async () => {
        const projectIds = await projectsCollection.addAsync([
            {
                name: "Project 1",
                name_insensitive: "PROJECT 1",
                icon: "people",
                createdBy: "user-1",
            },
            {
                name: "Project 2",
                name_insensitive: "PROJECT 2",
                icon: "favorite",
                createdBy: "user-1",
            },
        ]);

        const { container } = render(<ActiveProjectList />);
        const items = container.querySelectorAll(".settings-list-item");
        expect(items.length).toBe(2);

        const checkboxes = container.querySelectorAll("input[type=checkbox]");
        expect(checkboxes.length).toBe(2);

        act(() => {
            fireEvent.click(checkboxes[1]);
            fireEvent.click(items[0]);
        });

        expect(store.view.selection.size).toBe(2);

        // uncheck an item
        act(() => {
            fireEvent.click(checkboxes[0]);
        });

        expect(store.view.selection.size).toBe(1);

        act(() => {
            store.view.selection.clear();
            store.projects.deleteProjects(...projectIds);
        });

        await waitFor(
            () => expect(
                store.projects.activeProjects.length
            ).toBe(0)
        );

        await waitFor(
            () => expect(
                container.querySelectorAll(".settings-list-item").length
            ).toBe(0)
        );
    });

    it("redirects to project detail on project click", async () => {
        const projectIds = await projectsCollection.addAsync([
            {
                name: "Project 1",
                name_insensitive: "PROJECT 1",
                icon: "people",
                createdBy: "user-1",
            },
        ]);

        const { getByText, container } = render(<ActiveProjectList />);
        const item = container.querySelector(".settings-list-item");
        expect(item).not.toBeNull();

        act(() => {
            fireEvent.click(item!);
        });

        await waitFor(() => expect(getByText("GoToProject")));

        act(() => {
            store.projects.deleteProjects(...projectIds);
        });

        await waitFor(() => expect(store.projects.activeProjects.length).toBe(0));

        await waitFor(
            () => expect(
                container.querySelector(".settings-list-item")
            ).toBeNull()
        );
    });

    it("does not allow unauthorised users to edit project", async () => {
        (canEditProject as any)
            .mockReturnValueOnce(false);

        const projectIds = await projectsCollection.addAsync([
            {
                name: "Project 1",
                name_insensitive: "PROJECT 1",
                icon: "people",
                createdBy: "user-1",
            },
        ]);

        const { queryByText, container } = render(<ActiveProjectList />);
        const item = container.querySelector(".settings-list-item");
        expect(item).not.toBeNull();

        act(() => {
            fireEvent.click(item!);
        });

        await waitFor(() => expect(queryByText("GoToProject")).toBeNull());

        act(() => {
            store.projects.deleteProjects(...projectIds);
        });

        await waitFor(() => expect(store.projects.activeProjects.length).toBe(0));

        await waitFor(
            () => expect(
                container.querySelectorAll(".settings-list-item").length
            ).toBe(0)
        );
    })
});
