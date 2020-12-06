import fs from "fs";
import path from "path";

import React from "react";
import type firebase from "firebase";

import { Store } from "../../../stores/root-store";
import { ActiveProjectList } from ".";
import { render, waitFor, fireEvent } from "@testing-library/react";
import { canEditProject } from "../../../rules";
import { act } from "react-dom/test-utils";
import { StoreContext } from "../../../contexts/store-context";
import { initializeTestApp, clearFirestoreData, loadFirestoreRules } from "@firebase/rules-unit-testing";

jest.mock("../../../internal", () => ({
    GoToProject: () => "GoToProject",
}));

jest.mock("../../../rules");

const projectId = "project-list-active-test";
const app = initializeTestApp({
    projectId,
});

let store: Store;
const setupAsync = async () => {
    store = new Store({
        firestore: app.firestore(),
    });
    await Promise.all([
        store.user.usersCollection.addAsync(
            {
                name: "user 1",
                team: "team-1",
                roles: {
                    user: true,
                },
                uid: "user-1",
                tasks: new Map(),
                recentProjects: [],
                divisionId: "",
            },
            "user-1",
        ),
    ]);

    store.auth.setUser({
        uid: "user-1",
    } as firebase.User);
};

beforeAll(async () => {
    await loadFirestoreRules({
        projectId,
        rules: fs.readFileSync(path.resolve(__dirname, "../../../../firestore.rules.test"), "utf8"),
    })
})

beforeEach(() => setupAsync());

afterEach(async () => {
    store.dispose();
    await clearFirestoreData({
        projectId,
    });
});

afterAll(() => app.delete());

describe("ProjectListActive", () => {

    it("renders without projects", () => {
        const { asFragment, unmount, } = render(
            <StoreContext.Provider value={store}>
                <ActiveProjectList />
            </StoreContext.Provider>
        );

        expect(asFragment()).toMatchSnapshot();

        unmount();
    });

    it("displays active projects", async () => {
        const projectIds = await store.projects.addDocuments([
            {
                name: "Project 1",
                icon: "people",
                createdBy: "user-1",
                divisionId: "",
            },
        ]);

        const { getByText, queryByText, unmount, } = render(
            <StoreContext.Provider value={store}>
                <ActiveProjectList />
            </StoreContext.Provider>
        );
        await waitFor(() => getByText("Project 1"));

        await act(async () => {
            await store.projects.collection.updateAsync({
                isArchived: true,
            }, ...projectIds);
        });

        await waitFor(() => expect(queryByText("Project 1")).toBeNull());

        await act(async () => {
            await store.projects.collection.updateAsync({
                isArchived: false,
            }, ...projectIds);
        });

        await waitFor(() => getByText("Project 1"));

        unmount();
    });

    it("allow to select multiple projects", async () => {
        const projectIds = await store.projects.addDocuments([
            {
                name: "Project 1",
                icon: "people",
                createdBy: "user-1",
                divisionId: "",
            },
            {
                name: "Project 2",
                icon: "favorite",
                createdBy: "user-1",
                divisionId: "",
            },
        ]);

        const { container, unmount, } = render(
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

        unmount();
    });

    it("redirects to project detail on project click", async () => {
        const projectIds = await store.projects.addDocuments([
            {
                name: "Project 1",
                icon: "people",
                createdBy: "user-1",
                divisionId: "",
            },
        ]);

        const { getByText, container, unmount, } = render(
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

        unmount();
    });

    it("does not allow unauthorised users to edit project", async () => {
        (canEditProject as any)
            .mockReturnValueOnce(false);

        const projectIds = await store.projects.addDocuments([
            {
                name: "Project 1",
                icon: "people",
                createdBy: "user-1",
                divisionId: "",
            },
        ]);

        const { queryByText, container, unmount } = render(
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

        unmount();
    })
});
