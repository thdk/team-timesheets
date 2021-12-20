import React from "react";
import path from "path";
import fs from "fs";

import { ProjectsPage } from "./index";
import { screen, render, waitFor } from "@testing-library/react";
import { initializeTestEnvironment, RulesTestEnvironment, } from "@firebase/rules-unit-testing";
import { IRootStore, Store } from "../../stores/root-store";
import { useStore } from "../../contexts/store-context";
import { User } from "firebase/auth";

jest.mock("../../contexts/store-context");

let testEnv: RulesTestEnvironment;

let store: IRootStore;
beforeAll(async () => {
    const projectId = "projects-page";
    testEnv = await initializeTestEnvironment({
        projectId,
        firestore: {
            rules: fs.readFileSync(path.resolve(__dirname, "../../../firestore.rules.test"), "utf8"),
        }
    });
});

beforeEach(async () => {
    store = new Store({
        firestore: testEnv.unauthenticatedContext().firestore() as any,
    });

    await store.auth.addDocument({
        uid: "user-1",
        divisionId: "",
        name: "User 1",
        recentProjects: [],
        roles: { user: true },
        tasks: new Map(),
        email: "user@timesheets.com",
    }, "user-1");

    store.auth.setUser({
        uid: "user-1",
    } as User);

    (useStore as jest.Mock<ReturnType<typeof useStore>>).mockReturnValue(store);
});

afterEach(async () => {
    store.dispose();
    //jest.clearAllMocks();
    await testEnv.unauthenticatedContext();
});

afterAll(() => testEnv.cleanup());


jest.mock('../../containers/projects/list', () => ({
    ArchivedProjectList: () => <>Archived projects list</>,
    ActiveProjectList: () => <>Active projects list</>,
}));


describe("ProjectsPage", () => {
    it("should show tabs for active and archived projects", async () => {
        await waitFor(() => !!store.user.authenticatedUser);
        render(
            <ProjectsPage />
        );

        await waitFor(() => {
            screen.getByText("Active projects");
        });

        screen.getByText("Archived projects");
    });

    it("should show active projects by default", async () => {
        await waitFor(() => !!store.user.authenticatedUser);
        render(
            <ProjectsPage />
        );

        await waitFor(() => {
            screen.getByText("Active projects list");
        });

        expect(screen.queryByText("Archived projects list")).toBeNull();
    });

    it("should show the content for selected tab", async () => {
        await waitFor(() => !!store.user.authenticatedUser);
        render(
            <ProjectsPage />
        );

        await waitFor(() => {
            screen.getByText("Active projects list");
        });

        screen.getByText("Archived projects").click();

        await waitFor(() => {
            screen.getByText("Archived projects list");
        });
    });

    it("should toggle actions when projects are selected and deselected", async () => {
        await waitFor(() => !!store.user.authenticatedUser);

        expect(store.view.actions.length).toBe(0);
        render(
            <ProjectsPage />
        );

        expect(store.view.actions.length).toBe(0);

        store.view.toggleSelection("project-id-1");

        await waitFor(() => {
            expect(store.view.actions.length).toBe(2);
        });

        store.view.toggleSelection("project-id-1");


        await waitFor(() => {
            expect(store.view.actions.length).toBe(0);
        });
    });
});
