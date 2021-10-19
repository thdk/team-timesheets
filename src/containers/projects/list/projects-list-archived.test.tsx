import React from "react";


import fs from "fs";
import path from "path";

import { Store } from "../../../stores/root-store";
import { ArchivedProjectList } from ".";
import { render, waitFor, fireEvent } from "@testing-library/react";
import { canManageProjects } from "../../../rules";
import { act } from "react-dom/test-utils";
import { StoreContext } from "../../../contexts/store-context";
import { RulesTestEnvironment, initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { User } from "firebase/auth";

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
                divisionId: "",
                recentProjects: [],
                tasks: new Map(),
                uid: "user-1",
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

beforeEach(async () => {
    await setupAsync();
    await waitFor(() => expect(store.auth.activeDocument).toBeTruthy());
});

afterEach(async () => {
    store.dispose();
    await testEnv.clearFirestore();
});

afterAll(() => testEnv.cleanup());

describe("ProjectListArchived", () => {
    it("renders without projects", () => {
        const { asFragment, unmount, } = render(
            <StoreContext.Provider value={store}>
                <ArchivedProjectList />
            </StoreContext.Provider>
        );

        expect(asFragment()).toMatchSnapshot();

        unmount();
    });

    it("displays archived projects", async () => {
        await store.projects.addDocument(
            {
                name: "Project 1",
                icon: "people",
                createdBy: "user-1",
                isArchived: true,
                divisionId: "",
            },
            "project-1",
        );

        const { getByText, queryByText, unmount, } = render(
            <StoreContext.Provider value={store}>
                <ArchivedProjectList />
            </StoreContext.Provider>
        );
        await waitFor(() => getByText("Project 1"));

        await store.projects.updateDocument({
            isArchived: false,
        }, "project-1");

        await waitFor(() => expect(queryByText("Project 1")).toBeNull());

        await store.projects.updateDocument({
            isArchived: true,
        }, "project-1");

        await waitFor(() => getByText("Project 1"));

        unmount();
    });

    it("allow to select multiple projects", async () => {
        await Promise.all([
            store.projects.addDocument(
                {
                    name: "Project 1",
                    icon: "people",
                    createdBy: "user-1",
                    isArchived: true,
                    divisionId: "",
                },
            ),
            store.projects.addDocument(
                {
                    name: "Project 2",
                    icon: "favorite",
                    createdBy: "user-1",
                    isArchived: true,
                    divisionId: "",
                },
            ),
        ]);

        const { container, unmount } = render(
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

        unmount();
    });

    it("does not allow unauthorised users to click a project", async () => {
        (canManageProjects as any)
            .mockReturnValue(false);

        await store.projects.addDocument(
            {
                name: "Project 1",
                icon: "people",
                createdBy: "user-1",
                isArchived: true,
                divisionId: "",
            },
        );

        const { container, unmount } = render(
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

        unmount();
    });
});
