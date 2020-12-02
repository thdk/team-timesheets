import React from "react";
import { initTestFirestore, deleteFirebaseAppsAsync } from "../../../__tests__/utils/firebase";
import { Store } from "../../../stores/root-store";
import { TestCollection } from "../../../__tests__/utils/firestorable/collection";
import { IProjectData } from "../../../../common";
import { ActiveProjectList } from ".";
import { render, waitFor, fireEvent } from "@testing-library/react";
import { canEditProject } from "../../../rules";
import { act } from "react-dom/test-utils";
import { StoreContext } from "../../../contexts/store-context";

const {
    firestore,
    clearFirestoreDataAsync,
    refs: [
        userRef,
        projectRef,
    ]
} = initTestFirestore("project-list-active-test",
    [
        "users",
        "projects",
    ]);

const userCollection = new TestCollection(
    firestore,
    userRef,
);

const projectsCollection = new TestCollection<IProjectData>(firestore, projectRef);

const setupAsync = () => {
    return Promise.all([
        userCollection.addAsync(
            {
                name: "user 1",
                team: "team-1",
                roles: {
                    user: true,
                }
            },
            "user-1",
        ),
    ]);
};

jest.mock("../../../internal", () => ({
    GoToProject: () => "GoToProject",
}));

jest.mock("../../../rules");

describe("ProjectListActive", () => {
    let store: Store;
    beforeEach(async () => {
        await setupAsync();

        store = new Store({
            firestore,
        });

        store.auth.setUser({
            uid: "user-1",
        } as firebase.User);
    });

    afterEach(async () => {
        store.dispose();
        await clearFirestoreDataAsync();
    });

    afterAll(deleteFirebaseAppsAsync);

    it("renders without projects", () => {
        const { asFragment } = render(
            <StoreContext.Provider value={store}>
                <ActiveProjectList />
            </StoreContext.Provider>
        );

        expect(asFragment()).toMatchSnapshot();
    });

    it("displays active projects", async () => {
        const projectIds = await projectsCollection.addAsync([
            {
                name: "Project 1",
                name_insensitive: "PROJECT 1",
                icon: "people",
                createdBy: "user-1",
                divisionId: "",
            },
        ]);

        const { getByText, queryByText } = render(
            <StoreContext.Provider value={store}>
                <ActiveProjectList />
            </StoreContext.Provider>
        );
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
                divisionId: "",
            },
            {
                name: "Project 2",
                name_insensitive: "PROJECT 2",
                icon: "favorite",
                createdBy: "user-1",
                divisionId: "",
            },
        ]);

        const { container } = render(
            <StoreContext.Provider value={store}>
                <ActiveProjectList />
            </StoreContext.Provider>
        );

        let items: HTMLElement[];
        await waitFor(() => {
            items = Array.from(container.querySelectorAll<HTMLElement>(".settings-list-item"));
            expect(items.length).toBe(2);
        });

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
                divisionId: "",
            },
        ]);

        const { getByText, container } = render(
            <StoreContext.Provider value={store}>
                <ActiveProjectList />
            </StoreContext.Provider>
        );

        let item: HTMLElement;
        await waitFor(() => {
            item = container.querySelector<HTMLElement>(".settings-list-item")!;
            expect(item).not.toBeNull();
        });

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
                divisionId: "",
            },
        ]);

        const { queryByText, container } = render(
            <StoreContext.Provider value={store}>
                <ActiveProjectList />
            </StoreContext.Provider>
        );

        let item: HTMLElement;
        await waitFor(() => {
            item = container.querySelector<HTMLElement>(".settings-list-item")!;
            expect(item).not.toBeNull();
        });

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
