import React from "react";
import { initTestFirestore, deleteFirebaseAppsAsync } from "../../../__tests__/utils/firebase";
import { Store } from "../../../stores/root-store";
import { TestCollection } from "../../../__tests__/utils/firestorable/collection";
import { IProjectData } from "../../../../common";
import { ArchivedProjectList } from ".";
import { render, waitFor, fireEvent } from "@testing-library/react";
import { canManageProjects } from "../../../rules";
import { act } from "react-dom/test-utils";
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
const store = new Store({
    firestore,
});

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
    ]).then(() => {
        store.auth.setUser({
            uid: "user-1",
        } as firebase.User);
    });
};

jest.mock("../../../contexts/store-context", () => ({
    useStore: () => store,
}));

jest.mock("../../../rules");

beforeAll(() => Promise.all([
    clearFirestoreDataAsync(),
    setupAsync(),
]));

afterAll(() => {
    store.dispose();
    return Promise.all([
        deleteFirebaseAppsAsync(),
    ])
});


describe("ProjectListArchived", () => {

    it("renders without projects", () => {
        const { asFragment } = render(<ArchivedProjectList />);

        expect(asFragment()).toMatchSnapshot();
    });

    it("displays archived projects", async () => {
        const projectIds = await projectsCollection.addAsync([
            {
                name: "Project 1",
                name_insensitive: "PROJECT 1",
                icon: "people",
                createdBy: "user-1",
                isArchived: true,
            },
        ]);

        const { getByText, queryByText } = render(<ArchivedProjectList />);
        await waitFor(() => getByText("Project 1"));

        await projectsCollection.updateAsync({
            isArchived: false,
        }, ...projectIds);

        await waitFor(() => expect(queryByText("Project 1")).toBeNull());

        await projectsCollection.updateAsync({
            isArchived: true,
        }, ...projectIds);

        await waitFor(() => getByText("Project 1"));

        await projectsCollection.deleteAsync(...projectIds);

        await waitFor(() => expect(queryByText("Project 1")).toBeNull());
    });

    it("allow to select multiple projects", async () => {
        const projectIds = await projectsCollection.addAsync([
            {
                name: "Project 1",
                name_insensitive: "PROJECT 1",
                icon: "people",
                createdBy: "user-1",
                isArchived: true,
            },
            {
                name: "Project 2",
                name_insensitive: "PROJECT 2",
                icon: "favorite",
                createdBy: "user-1",
                isArchived: true,
            },
        ]);

        const { container } = render(<ArchivedProjectList />);
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

        store.view.selection.clear();
        await projectsCollection.deleteAsync(...projectIds);

        await waitFor(() => expect(store.projects.activeProjects.length).toBe(0));
    });

    it("does not allow unauthorised users to click a project", async () => {
        (canManageProjects as any)
            .mockReturnValueOnce(false);

        const projectIds = await projectsCollection.addAsync([
            {
                name: "Project 1",
                name_insensitive: "PROJECT 1",
                icon: "people",
                createdBy: "user-1",
                isArchived: true,
            },
        ]);

        const { container } = render(<ArchivedProjectList />);
        const item = container.querySelector(".settings-list-item");
        expect(item).not.toBeNull();

        act(() => {
            fireEvent.click(item!);
        });

        await waitFor(() => expect(store.view.selection.size).toBe(0));

        await projectsCollection.deleteAsync(...projectIds);

        await waitFor(() => expect(store.projects.activeProjects.length).toBe(0));

    });
});
