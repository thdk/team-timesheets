import React from "react";
import { initTestFirestore, deleteFirebaseAppsAsync } from "../../../__tests__/utils/firebase";
import { Store } from "../../../stores/root-store";
import { TestCollection } from "../../../__tests__/utils/firestorable/collection";
import { IProjectData } from "../../../../common";
import { ArchivedProjectList } from ".";
import { render, waitFor, fireEvent } from "@testing-library/react";
import { canManageProjects } from "../../../rules";
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

jest.mock("../../../rules");


afterAll(deleteFirebaseAppsAsync);

describe("ProjectListArchived", () => {
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

    it("renders without projects", () => {
        const { asFragment } = render(
            <StoreContext.Provider value={store}>
                <ArchivedProjectList />
            </StoreContext.Provider>
        );

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
                divisionId: "",
            },
        ]);

        const { getByText, queryByText } = render(
            <StoreContext.Provider value={store}>
                <ArchivedProjectList />
            </StoreContext.Provider>
        );
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
                divisionId: "",
            },
            {
                name: "Project 2",
                name_insensitive: "PROJECT 2",
                icon: "favorite",
                createdBy: "user-1",
                isArchived: true,
                divisionId: "",
            },
        ]);

        const { container } = render(
            <StoreContext.Provider value={store}>
                <ArchivedProjectList />
            </StoreContext.Provider>
        );

        let items: HTMLElement[];
        await waitFor(() => {
            items = Array.from(
                container.querySelectorAll<HTMLElement>(".settings-list-item"),
            );
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

        store.view.selection.clear();
        await projectsCollection.deleteAsync(...projectIds);

        await waitFor(() => expect(store.projects.activeProjects.length).toBe(0));
    });

    it("does not allow unauthorised users to click a project", async () => {
        (canManageProjects as any)
            .mockReturnValue(false);

        const projectIds = await projectsCollection.addAsync([
            {
                name: "Project 1",
                name_insensitive: "PROJECT 1",
                icon: "people",
                createdBy: "user-1",
                isArchived: true,
                divisionId: "",
            },
        ]);

        const { container } = render(
            <StoreContext.Provider value={store}>
                <ArchivedProjectList />
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

        await waitFor(() => expect(store.view.selection.size).toBe(0));

        await projectsCollection.deleteAsync(...projectIds);

        await waitFor(() => expect(store.projects.activeProjects.length).toBe(0));

        (canManageProjects as any)
            .mockReturnValue(true);
    });
});
