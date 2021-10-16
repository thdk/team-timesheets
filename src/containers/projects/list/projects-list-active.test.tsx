import fs from "fs";
import path from "path";

import React from "react";


import { Store } from "../../../stores/root-store";
import { ActiveProjectList } from ".";
import { render, waitFor, fireEvent } from "@testing-library/react";
import { canEditProject } from "../../../rules";
import { act } from "react-dom/test-utils";
import { StoreContext } from "../../../contexts/store-context";
import { initializeTestEnvironment, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { User } from "firebase/auth";

jest.mock("../../../internal", () => ({
    GoToProject: () => "GoToProject",
}));

jest.mock("../../../rules");

const projectId = "project-list-active-test";

let store: Store;
const setupAsync = async () => {
    store = new Store({
        firestore,
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
    } as User);
};

let testEnv: RulesTestEnvironment;
let firestore: any;

beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
        projectId,
        firestore: {
            rules: fs.readFileSync(path.resolve(__dirname, "../../../../firestore.rules.test"), "utf8"),
        }
    });

    firestore = testEnv.unauthenticatedContext().firestore();
});

beforeEach(() => setupAsync());

afterEach(async () => {
    store.dispose();
    await testEnv.clearFirestore();
});

afterAll(() => testEnv.cleanup());

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
        const projectId = await store.projects.addDocument(
            {
                name: "Project 1",
                icon: "people",
                createdBy: "user-1",
                divisionId: "",
            },
        );

        const { getByText, queryByText, } = render(
            <StoreContext.Provider value={store}>
                <ActiveProjectList />
            </StoreContext.Provider>
        );
        await waitFor(() => expect(store.projects.collection.isFetched).toBeTruthy());
        await waitFor(() => getByText("Project 1"));

        await act(async () => {
            await store.projects.collection.updateAsync({
                isArchived: true,
            }, projectId);
        });

        await waitFor(() => expect(queryByText("Project 1")).toBeNull());
    });

    it("allow to select multiple projects", async () => {
        const projectId1 = await store.projects.addDocument(
            {
                name: "Project 1",
                icon: "people",
                createdBy: "user-1",
                divisionId: "",
            }
        );

        const projectId2 = await store.projects.addDocument(
            {
                name: "Project 2",
                icon: "favorite",
                createdBy: "user-1",
                divisionId: "",
            },
        );

        const projectIds = [projectId1, projectId2];

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
        await store.projects.addDocument(
            {
                name: "Project 1",
                icon: "people",
                createdBy: "user-1",
                divisionId: "",
            },
        );

        const { getByText, container, } = render(
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
    });

    it("does not allow unauthorised users to edit project", async () => {
        (canEditProject as any)
            .mockReturnValueOnce(false);

        await store.projects.addDocument(
            {
                name: "Project 1",
                icon: "people",
                createdBy: "user-1",
                divisionId: "",
            },
        );

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
    })
});
