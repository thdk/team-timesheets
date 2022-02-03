import React from "react";
import path from "path";
import fs from "fs";

import { ProjectsPage } from "./index";
import { screen, render, waitFor } from "@testing-library/react";
import { initializeTestEnvironment, RulesTestEnvironment, } from "@firebase/rules-unit-testing";
import { IRootStore, Store } from "../../stores/root-store";
import { useStore } from "../../contexts/store-context";
import { User } from "firebase/auth";
import { App, goToNewProject, goToProjects } from "../../internal";
import { useRegistrationStore } from "../../contexts/registration-context";
import { IRegistration } from "../../../common";
import { IRegistrationsStore } from "../../stores/registration-store";
import { useProjectStore } from "../../contexts/project-context";
import { useRouterStore } from "../../stores/router-store";

jest.mock("../../contexts/store-context");
jest.mock("../../contexts/registration-context");
jest.mock('../../routes/projects/list');
jest.mock('../../contexts/project-context');
jest.mock("../../stores/router-store");
jest.mock("../../routes/projects/detail");

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
        githubRepos: [],
    }, "user-1");

    store.auth.setUser({
        uid: "user-1",
    } as User);

    (useStore as jest.Mock<ReturnType<typeof useStore>>).mockReturnValue(store);
});

afterEach(async () => {
    store.dispose();
    jest.clearAllMocks();
    await testEnv.unauthenticatedContext();
});

afterAll(() => testEnv.cleanup());

jest.mock('../../containers/projects/list', () => ({
    ArchivedProjectList: () => (
        <>Archived projects list</>
    ),
    ActiveProjectList: () => (
        <>Active projects list</>
    ),
}));


describe("ProjectsPage", () => {
    const goToProjectsMock = jest.fn();
    beforeAll(() => {
        (goToProjects as jest.Mock<typeof goToProjects>).mockImplementation(goToProjectsMock);
    })

    it("should show tabs for active and archived projects", async () => {
        await waitFor(() => !!store.user.authenticatedUser);
        render(
            <App>
                <ProjectsPage />
            </App>
        );

        await waitFor(() => {
            screen.getByText("Active projects");
        });

        screen.getByText("Archived projects");
    });

    it("should show active projects by default", async () => {
        await waitFor(() => !!store.user.authenticatedUser);
        render(
            <App>
                <ProjectsPage />
            </App>
        );

        await waitFor(() => {
            screen.getByText("Active projects list");
        });

        expect(screen.queryByText("Archived projects list")).toBeNull();
    });

    it("should redirect to update ui when archived tab is clicked", async () => {
        await waitFor(() => !!store.user.authenticatedUser);
        render(
            <App>
                <ProjectsPage />
            </App>
        );

        await waitFor(() => {
            screen.getByText("Active projects list");
        });

        screen.getByText("Archived projects").click();

        expect(goToProjectsMock).toHaveBeenCalledWith(
            expect.anything(),
            "archived",
            expect.anything(),
        );
    });

    it("should toggle actions when projects are selected and deselected", async () => {
        await waitFor(() => !!store.user.authenticatedUser);

        expect(store.view.actions.length).toBe(0);
        render(
            <App>
                <ProjectsPage />
            </App>
        );

        store.view.toggleSelection("project-id-1");

        await waitFor(() => {
            screen.getByText("delete");
            screen.getByText("archive");
        })

        store.view.toggleSelection("project-id-1");

        await waitFor(() => {
            expect(store.view.actions.length).toBe(0);
        });
    });

    it("should not allow to delete used projects", async () => {
        const queryAsync = jest.fn().mockResolvedValue([
            1,
            2,
        ] as unknown as IRegistration[]);

        (useRegistrationStore as jest.Mock<ReturnType<typeof useRegistrationStore>>).mockReturnValue({
            collection: {
                queryAsync,
            },
            registrationsGroupedByDay: [],
        } as unknown as IRegistrationsStore);

        const deleteProjects = jest.fn();
        (useProjectStore as jest.Mock<ReturnType<typeof useProjectStore>>).mockReturnValue(({
            deleteProjects,
        } as any))

        await waitFor(() => !!store.user.authenticatedUser);

        render(
            <App>
                <ProjectsPage />
            </App>
        );

        store.view.toggleSelection("project-id-1");

        const deleteIcon = await screen.findByText("delete");
        deleteIcon.click();

        await waitFor(() => {
            expect(queryAsync).toHaveBeenCalled();
        });


        expect(deleteProjects).not.toHaveBeenCalled();
    });

    it("should allow to delete unused projects", async () => {
        const queryAsync = jest.fn().mockResolvedValue([] as IRegistration[]);

        (useRegistrationStore as jest.Mock<ReturnType<typeof useRegistrationStore>>).mockReturnValue({
            collection: {
                queryAsync,
            },
            registrationsGroupedByDay: [],
        } as unknown as IRegistrationsStore);

        const deleteProjects = jest.fn();
        (useProjectStore as jest.Mock<ReturnType<typeof useProjectStore>>).mockReturnValue(({
            deleteProjects,
        } as any))

        await waitFor(() => !!store.user.authenticatedUser);

        expect(store.view.actions.length).toBe(0);
        render(
            <App>
                <ProjectsPage />
            </App>
        );

        store.view.toggleSelection("project-id-1");

        const deleteIcon = await screen.findByText("delete");
        deleteIcon.click();

        await waitFor(() => {
            expect(queryAsync).toHaveBeenCalled();
        });

        expect(deleteProjects).toHaveBeenCalled();
    });

    it("should allow to archive projects", async () => {
        const archiveProjects = jest.fn();
        (useProjectStore as jest.Mock<ReturnType<typeof useProjectStore>>).mockReturnValue(({
            archiveProjects,
        } as any))

        await waitFor(() => !!store.user.authenticatedUser);

        render(
            <App>
                <ProjectsPage />
            </App>
        );

        store.view.toggleSelection("project-id-1");

        const archiveIcon = await screen.findByText("archive");
        archiveIcon.click();

        expect(archiveProjects).toHaveBeenCalled();
    });

    it("should allow to unarchive projects", async () => {
        const unarchiveProjects = jest.fn();
        (useProjectStore as jest.Mock<ReturnType<typeof useProjectStore>>).mockReturnValue(({
            unarchiveProjects,
        } as any));

        (useRouterStore as jest.Mock<Partial<ReturnType<typeof useRouterStore>>>).mockReturnValue({
            queryParams: {
                tab: "archived",
            },
            
        });

        await waitFor(() => !!store.user.authenticatedUser);

        render(
            <App>
                <ProjectsPage />
            </App>
        );

        store.view.toggleSelection("project-id-1");

        const archiveIcon = await screen.findByText("unarchive");
        archiveIcon.click();

        expect(unarchiveProjects).toHaveBeenCalled();
    });

    it("should show a fab to create a new project", async () => {

        await waitFor(() => !!store.user.authenticatedUser);

        render(
            <App>
                <ProjectsPage />
            </App>
        );

        const fab = await screen.findByText("New project");
        fab.click();

        expect(goToNewProject).toHaveBeenCalled();
    });
});
