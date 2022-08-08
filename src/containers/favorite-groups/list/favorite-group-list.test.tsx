import React from "react";
import fs from "fs";
import path from "path";

import { initializeTestEnvironment, RulesTestEnvironment } from "@firebase/rules-unit-testing";


import { render, waitFor } from "@testing-library/react";
import { Store } from "../../../stores/root-store";
import { useStore } from "../../../contexts/store-context";
import FavoriteGroupList from ".";
import { User } from "firebase/auth";

jest.mock("../../../contexts/store-context");

const projectId = "favorite-group-list";

let store: Store;
const userId = "user-1";
const favoriteGroupIds: string[] = ["fav-1", "fav-2", "fav-3"];

const setupAsync = async () => {
    store = new Store({
        firestore,
    });

    await store.auth.addDocument({
        uid: userId,
        divisionId: "",
        name: "User 1",
        recentProjects: [],
        roles: { user: true },
        tasks: new Map(),
        email: "user@timesheets.com",
        githubRepos: [],
    }, userId);

    store.auth.setUser({
        uid: userId,
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
    (useStore as jest.Mock<ReturnType<typeof useStore>>).mockReturnValue(store);
});

afterEach(async () => {
    store.dispose();
    await testEnv.clearFirestore();
});

afterAll(() => testEnv.cleanup());
describe("FavoriteGroupList", () => {
    describe("when there are no favorite groups", () => {
        it("should render an empty list", async () => {
            const {
                asFragment,
                unmount,
            } = render(
                <FavoriteGroupList />
            );

            await waitFor(() => expect(store.favorites.collection.isFetched).toBeTruthy());

            expect(asFragment()).toMatchSnapshot();

            unmount();
        });

        it("should rerender the list when favorite groups are added in the database in the background", async () => {
            const {
                asFragment,
                getByText,
                unmount,
            } = render(
                <FavoriteGroupList />
            );

            await waitFor(() => expect(store.favorites.collection.isFetched).toBeTruthy());

            expect(asFragment()).toMatchSnapshot();

            await store.favorites.addDocument(
                {
                    name: "new fav group 1",
                    userId,
                },
            );

            await waitFor(() => getByText("new fav group 1"));

            unmount();
        });
    });

    describe("when there are favorite groups", () => {
        beforeEach(async () => {
            await Promise.all(
                [
                    store.favorites.addDocument(
                        {
                            name: "fav 1",
                            userId: userId,
                        },
                        "fav-1",
                    ),
                    store.favorites.addDocument(
                        {
                            name: "fav 2",
                            userId: userId,
                        },
                        "fav-2",
                    ),
                    store.favorites.addDocument(
                        {
                            name: "fav 3",
                            userId: userId,
                        },
                        "fav-3",
                    ),
                ]);

            await Promise.all([
                store.favorites.favoriteCollection.addAsync(
                {
                    groupId: favoriteGroupIds[1],
                    userId,
                    description: "fav reg 1",
                    time: 3,
                },
                ),
                store.favorites.favoriteCollection.addAsync({
                    groupId: favoriteGroupIds[1],
                    userId,
                    description: "fav reg 2",
                    time: 1,
                }),
            ]);
        });

        it(
            "should render list of favorite groups",
            async () => {

                const {
                    getByText,
                    unmount,
                } = render(
                    <FavoriteGroupList />
                );

                await waitFor(() => {
                    getByText("fav 1");
                    getByText("fav 2");
                    getByText("fav 3");
                });

                unmount();
            },
        );

        it(
            "should rerender list when one of the groups is updated in the database in the background",
            async () => {

                const {
                    getByText,
                    unmount,
                } = render(
                    <FavoriteGroupList />
                );

                await waitFor(() => {
                    getByText("fav 1");
                    getByText("fav 2");
                    getByText("fav 3");
                });

                await store.favorites.collection.updateAsync(
                    {
                        name: "fav 2 bis",
                    },
                    "fav-2",
                );

                await waitFor(() => {
                    getByText("fav 1");
                    getByText("fav 2 bis");
                    getByText("fav 3");
                });

                unmount();
            },
        );

    });
});
