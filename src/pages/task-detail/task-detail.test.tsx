import React from "react";
import type firebase from "firebase";
import fs from "fs";
import path from "path";
import { clearFirestoreData, loadFirestoreRules, initializeTestApp } from "@firebase/rules-unit-testing";
import { Store } from "../../stores/root-store";
import { render, waitFor } from "@testing-library/react";
import { TaskDetailPage } from ".";
import { useStore } from "../../contexts/store-context";
import taskRoutes from "../../routes/tasks";
import { Router } from "../../containers/router";
import { IViewAction } from "../../stores/view-store";

jest.mock("../../contexts/store-context");

const projectId = "task-detail-test";
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
                email: "email@email.com",
                roles: {
                    admin: true,
                },
                uid: "user-1",
                divisionId: "",
                recentProjects: [],
                tasks: new Map(),
            },
            "user-1",
        ),
        store.tasks.addDocument(
            {
                name: "Task 1",
                icon: "code",
            },
            "task1",
        ),
    ]);

    store.auth.setUser({
        uid: "user-1",
        displayName: "user 1",
        email: "email@email.com",
    } as firebase.User);
};

beforeAll(async () => {
    await loadFirestoreRules({
        projectId,
        rules: fs.readFileSync(path.resolve(__dirname, "../../../firestore.rules.test"), "utf8"),
    });
});

beforeEach(async () => {
    await setupAsync();

    (useStore as jest.Mock<ReturnType<typeof useStore>>).mockReturnValue(store);
});

afterEach(async () => {
    store.dispose();
    await clearFirestoreData({ projectId });
});

afterAll(() => app.delete());

describe("TaskDetailPage", () => {
    it("should set view actions when rendered", async () => {
        expect(store.view.actions.length).toBe(0);

        store.router.goTo(taskRoutes.taskDetail, {
            id: "task1",
        });

        const {
            unmount,
        } = render(
            <TaskDetailPage />
        );

        await waitFor(() => expect(store.view.actions.length).toBe(2));

        unmount();

        await waitFor(() => expect(store.view.actions.length).toBe(0));
    });

    it("should display data when there is an active task", async () => {
        await waitFor(() => expect(store.auth.activeDocument).toBeTruthy());

        store.router.goTo(taskRoutes.taskDetail, {
            id: "task1",
        });

        const {
            container,
            unmount,
        } = render(
            <Router />
        );

        await waitFor(() => expect(container.querySelector("input[value='Task 1']")).toBeDefined());

        await waitFor(() => expect(container.querySelector("input[value='code']")).toBeDefined());

        unmount();
    });

    describe("view actions: Delete", () => {
        it("should delete the active document", async () => {

            const {
                unmount,
            } = render(
                <Router />
            );

            store.router.goTo(
                taskRoutes.taskDetail,
                {
                    id: "task1",
                },
            );

            // https://github.com/testing-library/user-event/issues/506
            // userEvent.type(container, "{ctrl}{del}");

            let deleteAction: IViewAction<any> | undefined;
            await waitFor(() => {
                deleteAction = store.view.actions.find(a => a.icon.label === "Delete");
                expect(deleteAction).toBeDefined();
            });

            unmount();

            await waitFor(() => {
                expect(store.view.actions.length).toBe(0);
            });

            deleteAction?.action();

            await expect(app.firestore().collection("tasks").doc("task1").get({
                source: "server",
            })).resolves.toEqual(
                expect.objectContaining({
                    exists: false,
                }),
            );
        });
    });

    describe("view actions: Save", () => {
        it("should save the active document", async () => {

            const {
                unmount,
                container,
            } = render(
                <Router />
            );

            store.router.goTo(
                taskRoutes.taskDetail,
                {
                    id: "task1",
                },
            );

            // https://github.com/testing-library/user-event/issues/506
            // userEvent.type(container, "{ctrl}{del}");
            await waitFor(() => {
                expect(store.tasks.activeDocument).toBeDefined();
            });

            store.tasks.activeDocument!.name = "Foo";

            let saveAction: IViewAction<any> | undefined;
            await waitFor(() => {
                saveAction = store.view.actions.find(a => a.icon.label === "Save");
                expect(saveAction).toBeDefined();
            });

            saveAction?.action();

            await waitFor(() => expect(container.querySelector("input[value='Foo']")).toBeDefined());

            unmount();

            await waitFor(() => {
                expect(store.view.actions.length).toBe(0);
            });
        });
    });
});
