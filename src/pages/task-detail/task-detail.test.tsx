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

jest.mock("../../contexts/store-context");

const projectId = "task-detail-test";
const app = initializeTestApp({
    projectId,
    auth: {
        uid: "user-1",
    },
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
            "task-1",
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
            id: "task-1",
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
            id: "task-1",
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
                    id: "task-1",
                },
            );

            // https://github.com/testing-library/user-event/issues/506
            // userEvent.type(container, "{ctrl}{del}");

            await waitFor(() => {
                const deleteAction = store.view.actions.find(a => a.icon.label === "Delete");
                expect(deleteAction).toBeDefined();
                deleteAction?.action();
            });

            await expect(app.firestore().collection("tasks").doc("task-1").get()).resolves.toEqual(
                expect.objectContaining({
                    exists: false,
                }),
            );

            unmount();
        });
    });

    describe("view actions: Save", () => {
        it("should delete the active document", async () => {

            const {
                unmount,
            } = render(
                <Router />
            );

            store.router.goTo(
                taskRoutes.taskDetail,
                {
                    id: "task-1",
                },
            );

            // https://github.com/testing-library/user-event/issues/506
            // userEvent.type(container, "{ctrl}{del}");

            await waitFor(() => {
                if (store.tasks.activeDocument) {
                    store.tasks.activeDocument.name = "Foo";
                }

                const saveAction = store.view.actions.find(a => a.icon.label === "Save");
                expect(saveAction).toBeDefined();
                saveAction?.action();
            });

            await waitFor(async () => {
                const doc = store.tasks.collection.getAsync("task-1");
            });
            
            (expect().resolves.toEqual(
                expect.objectContaining({
                    data: expect.objectContaining({
                        name: "Foo",
                    }),
                })
            );
            unmount();
        });
    });
});
