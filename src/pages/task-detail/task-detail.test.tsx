import React from "react";
import type firebase from "firebase";
import fs from "fs";
import path from "path";
import { clearFirestoreData, loadFirestoreRules, initializeTestApp } from "@firebase/rules-unit-testing";
import { Store, IRootStore } from "../../stores/root-store";
import { render, waitFor } from "@testing-library/react";
import { TaskDetailPage } from ".";
import { useStore } from "../../contexts/store-context";
import { useRouterStore } from "../../stores/router-store";
import { RouterStore } from "mobx-router";

jest.mock("../../contexts/store-context");
jest.mock("../../stores/router-store");

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
    (useRouterStore as jest.Mock<ReturnType<typeof useRouterStore>>).mockReturnValue({
        params: undefined,
    } as unknown as RouterStore<IRootStore>);
});

afterEach(async () => {
    store.dispose();
    await clearFirestoreData({ projectId });
});

afterAll(() => app.delete());

describe("TaskDetailPage", () => {
    it("should render", async () => {
        await waitFor(() => expect(store.auth.activeDocument).toBeTruthy());

        const {
            asFragment,
            unmount,
        } = render(
            <TaskDetailPage />
        );

        expect(asFragment()).toMatchSnapshot();

        unmount();
    });

    it("should set view actions when rendered", async () => {
        expect(store.view.actions.length).toBe(0);

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

        (useRouterStore as jest.Mock<ReturnType<typeof useRouterStore>>).mockReturnValue({
            params: {
                id: "task-1",
            },
        } as unknown as RouterStore<IRootStore>);


        const {
            container,
            unmount,
        } = render(
            <TaskDetailPage />
        );

        await waitFor(() => expect(container.querySelector("input[value='Task 1']")).toBeDefined());

        await waitFor(() => expect(container.querySelector("input[value='code']")).toBeDefined());

        unmount();
    });

    // describe("view actions: Delete", () => {
    //     it("should delete the active document", async () => {
    //         (useRouterStore as jest.Mock<ReturnType<typeof useRouterStore>>).mockReturnValue({
    //             params: {
    //                 id: "task-1",
    //             },
    //         } as unknown as RouterStore<IRootStore>);

    //         const {
    //             unmount,
    //         } = render(
    //             <TaskDetailPage />
    //         );

    //         // https://github.com/testing-library/user-event/issues/506
    //         // userEvent.type(container, "{ctrl}{del}");

    //         await waitFor(() => {
    //             const deleteAction = store.view.actions.find(a => a.icon.label === "Delete");
    //             expect(deleteAction).toBeDefined();
    //             deleteAction?.action();
    //         });

    //         console.warn("OK");

    //         await expect(() => app.firestore().collection("tasks").doc("task-1").get()).resolves.toEqual(
    //             expect.objectContaining({
    //                 exists: false,
    //             }),
    //         );

    //         unmount();
    //     });
    // })
});
