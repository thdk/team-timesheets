import React from "react";
import type firebase from "firebase";

import path from "path";
import fs from "fs";

import { FavoritesList } from ".";
import { StoreContext } from "../../../contexts/store-context";
import { Store } from "../../../stores/root-store";
import { render, waitFor } from "@testing-library/react";
import { loadFirestoreRules, clearFirestoreData, initializeTestApp } from "@firebase/rules-unit-testing";

const projectId = "favorites-list-test";
const app = initializeTestApp({
    projectId,
});

let store: Store;

beforeAll(async () => {
    await loadFirestoreRules({
        projectId,
        rules: fs.readFileSync(path.resolve(__dirname, "../../../../firestore.rules.test"), "utf8"),
    })
});

beforeEach(() => {
    store = new Store({
        firestore: app.firestore(),
    });
});

afterEach(async () => {
    store.dispose();
    await clearFirestoreData({
        projectId,
    });
})

afterAll(() => app.delete());

describe("FavoritesList", () => {

    it("should render without favorites", () => {

        const { asFragment, unmount, } = render(
            <StoreContext.Provider value={store}>
                <FavoritesList />
            </StoreContext.Provider>
        );

        expect(asFragment()).toMatchSnapshot();

        unmount();
    });

    it("should render favorites", async () => {
        const setupAsync = () => {

            return Promise.all([
                // favorites
                store.favorites.favoriteCollection.addAsync([
                    {
                        groupId: "group-1",
                        userId: "user-1",
                        description: "Favorite desc 1",
                        client: "client-1",
                        time: 3,
                    },
                    {
                        groupId: "group-1",
                        userId: "user-1",
                        description: "Favorite desc 2",
                        task: "task-1",
                        time: 2,
                    },
                    {
                        groupId: "group-1",
                        userId: "user-1",
                        description: "Favorite desc 3",
                        task: "task-1",
                        project: "project-1",
                        time: 2,
                    },
                ]),
                store.user.usersCollection.addAsync(
                    {
                        name: "user 1",
                        uid: "user-1",
                        email: "email@email.com",
                        roles: {
                            user: true,
                        },
                        divisionId: "",
                        tasks: new Map(),
                        recentProjects: [],
                    },
                    "user-1",
                ),
                store.config.clientsCollection.addAsync(
                    {
                        name: "client 1",
                        divisionId: "",
                    },
                    "client-1",
                ),
                store.favorites.addDocument(
                    {
                        name: "group 1",
                        userId: "user-1",
                    },
                    "group-1",
                ),
                store.projects.addDocument(
                    {
                        createdBy: "user-1",
                        name: "project 1",
                        divisionId: "",
                    },
                    "project-1",
                ),
                store.config.tasksCollection.addAsync(
                    {
                        name: "task 1",
                        divisionId: "",
                    },
                    "task-1",
                ),
            ]);
        };

        await setupAsync();

        store.auth.setUser({
            uid: "user-1",
            displayName: "user 1",
            email: "email@email.com",
        } as firebase.User);

        store.favorites.setActiveDocumentId("group-1");

        const { getByText, asFragment, unmount, } = render(
            <StoreContext.Provider value={store}>
                <FavoritesList />
            </StoreContext.Provider>
        );

        // FavoritesList will fetch favorites by groupId once it get's rendered
        // so we have to wait here for those favorites to be fetched and rendered
        await waitFor(
            () => expect(getByText("Favorite desc 2")),
        );

        await waitFor(() => expect(store.config.clientsCollection.isFetched).toBeTruthy());
        await waitFor(() => expect(asFragment()).toMatchSnapshot());

        unmount();
    });
});