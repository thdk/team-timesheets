import { Store } from "../root-store";
import path from "path";
import fs from "fs";

import { waitFor } from "@testing-library/react";
import { useStore } from "../../contexts/store-context";
import { IFavoriteRegistration } from "../../../common";
import { initializeTestEnvironment, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { User } from "firebase/auth";
import type { FirebaseFirestore } from "@firebase/firestore-types";

jest.mock("../../contexts/store-context");

describe("FavoriteStore", () => {
    let store: Store;
    const projectId = "favorite-store-test";

    let divisionUserId1: string;
    let divisionUserId2: string;
    const divisionId1 = "div-1";
    const divisionId2 = "div-2";

    const setupAsync = async () => {
        store = new Store({
            firestore: firestore as any,
        });

        await Promise.all([
            store.auth.collection.addAsync(
                {
                    name: "user 1",
                    team: "team-1",
                    roles: {
                        user: true,
                    },
                    uid: "user-1",
                    divisionId: "",
                    recentProjects: [],
                    tasks: new Map(),
                    githubRepos: [],
                },
                "user-1",
            ),
            store.divisions.addDocument(
                {
                    name: "Division 1",
                    createdBy: "user-1",
                    icon: "business",
                    id: divisionId1
                },
            ),
            store.divisions.addDocument(
                {
                    name: "Division 2",
                    createdBy: "user-2",
                    icon: "house",
                    id: divisionId2
                },
            )
        ]);

        const generatedDivisionUserId1 = await store.user.divisionUsersCollection.addAsync(
            {
                name: "Division User 1",
                divisionId: divisionId1,
                tasks: new Map<string, true>(),
                recentProjects: [] as string[],
                uid: "user-1",
                roles: {},
                githubRepos: [],
            }
        );

        const generatedDivisionUserId2 = await store.user.divisionUsersCollection.addAsync(
            {
                name: "Division User 2",
                divisionId: divisionId2,
                tasks: new Map<string, true>(),
                recentProjects: [] as string[],
                uid: "user-1",
                roles: {},
                githubRepos: [],
            },
        );

        divisionUserId1 = generatedDivisionUserId1;
        divisionUserId2 = generatedDivisionUserId2;

        store.auth.setUser({
            uid: "user-1",
        } as User);

        await waitFor(() => expect(store.auth.activeDocument).toBeTruthy());
    };

    let testEnv: RulesTestEnvironment | undefined;
    let firestore: FirebaseFirestore;

    beforeAll(async () => {

        testEnv = await initializeTestEnvironment({
            projectId,
            firestore: {
                rules: fs.readFileSync(path.resolve(__dirname, "../../../firestore.rules.test"), "utf8"),
            }
        }).catch((e) => {
            console.error(e);
            throw e;
        });

        firestore = testEnv.unauthenticatedContext().firestore();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await setupAsync().catch(e => { console.log(e); throw e; });
        (useStore as jest.Mock<ReturnType<typeof useStore>>).mockReturnValue(store);
    });

    afterEach(async () => {
        try {
            if (store) {
                await store.dispose();
            }
            testEnv && await testEnv.clearFirestore();
        } catch (e) {
            console.error(e);
        }
    });

    afterAll(() => testEnv && testEnv.cleanup());

    describe("groups", () => {
        describe("when there are no favorite groups", () => {
            it("should return an empty array", () => {
                expect(store.favorites.groups.length).toBe(0);
            });
        });

        describe("when there are favorite groups", () => {
            beforeEach(async () => {
                await Promise.all([
                    store.favorites.addDocument(
                        {
                            name: "Fav group 1",
                            userId: "user-1",
                        },
                    ),
                    store.favorites.addDocument(
                        {
                            name: "Fav group 2",
                            userId: "user-1",
                        },
                    ),
                    store.favorites.addDocument(
                        {
                            name: "Fav group 3",
                            userId: "user-1",
                        },
                    ),
                    store.favorites.addDocument(
                        {
                            name: "Fav group 1",
                            userId: "user-2",
                        },
                    ),
                    store.favorites.addDocument(
                        {
                            name: "Fav group 1 - div 1",
                            userId: divisionUserId1,
                        },
                    ),
                    store.favorites.addDocument(
                        {
                            name: "Fav group 2 - div 1",
                            userId: divisionUserId1,
                        },
                    ),
                    store.favorites.addDocument(
                        {
                            name: "Fav group 1 - div 2",
                            userId: divisionUserId2,
                        },
                    ),
                ]);
            });

            it("should return an array of ", async () => {
                await waitFor(() => expect(store.user.divisionUser).toBeTruthy());
                await waitFor(() => expect(store.favorites.groups.length).toBe(3));
            });

            it("should return only favorite groups of the current division user", async () => {
                await waitFor(() => expect(store.user.divisionUser).toBeTruthy());

                await waitFor(() => expect(store.favorites.groups.length).toBe(3));

                store.auth.updateActiveDocument({
                    divisionUserId: divisionUserId1,
                    divisionId: divisionId1,
                });

                await waitFor(() => expect(store.favorites.groups.length).toBe(2));

                store.auth.updateActiveDocument({
                    divisionUserId: divisionUserId2,
                    divisionId: divisionId2,
                });

                await waitFor(() => expect(store.favorites.groups.length).toBe(1));

                store.auth.updateActiveDocument({
                    divisionUserId: undefined,
                    divisionId: undefined,
                });

                await waitFor(() => expect(store.favorites.groups.length).toBe(3));
            });
        });
    });

    describe("saveFavoriteGroup", () => {
        let groupId: string;

        beforeEach(
            async () => {
                try {

                    await waitFor(() => expect(store.user.divisionUser).toBeTruthy());
                    groupId = await store.favorites.addFavorites(
                        [
                            {
                                description: "reg 1",
                                userId: "user-1",
                                time: 3.3
                            },
                        ] as IFavoriteRegistration[],
                        {
                            name: "Fav group 1"
                        },
                    );
                    store.favorites.setActiveDocumentId(groupId);

                    await waitFor(
                        () => expect(
                            store.favorites.activeDocument,
                        ).not.toBeNull(),
                    );

                    await store.favorites.favoriteCollection.fetchAsync();
                    await waitFor(() => expect(
                        store.favorites.favoriteCollection.docs.map((doc) => doc.data!))
                        .toEqual(expect.arrayContaining([
                            expect.objectContaining({
                                description: "reg 1",
                            })
                        ]))
                    );
                } catch (e) {
                    console.error(e);
                    throw e;
                }
            });

        it("can set a new name for the favorite group", async () => {
            expect(store.favorites.activeDocument).toBeTruthy();
            if (store.favorites.activeDocument) {
                store.favorites.activeDocument.name = "New favorite group name";
            }

            await store.favorites.saveFavoriteGroup();

            await waitFor(
                () => expect(
                    store.favorites.groups,
                ).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            name: "New favorite group name",
                        }),
                    ])
                ),
            );
        });

        it("can override an existing favorite group when saved with same name", async () => {
            const groupId2 = await store.favorites.addFavorites(
                [
                    {
                        description: "reg 2",
                        userId: "user-1",
                        time: 4,
                    },
                    {
                        description: "reg 3",
                        userId: "user-1",
                        time: 2,
                    },
                ] as IFavoriteRegistration[],
                {
                    name: "Favorite"
                },
            );

            await waitFor(() => expect(
                store.favorites.groups.length,
            ).toBe(2),
            );

            store.favorites.setActiveDocumentId(groupId2);

            const registrations = await store.favorites.getFavoritesByGroupIdAsync(groupId2);

            expect(registrations).toHaveLength(2);

            if (store.favorites.activeDocument) {
                store.favorites.activeDocument.name = "Fav group 1";
            }
            await store.favorites.saveFavoriteGroup();

            await waitFor(() => {
                expect(store.favorites.groups).toHaveLength(1);
            });

            await store.favorites.deleteDocument(groupId2);
            await Promise.all(registrations.map((reg) => (store.favorites.favoriteCollection.deleteAsync(reg.id))));
            await store.favorites.favoriteCollection.fetchAsync();
            await waitFor(() => expect(store.favorites.groups).toHaveLength(0));
            await waitFor(() => {
                expect(store.favorites.getFavoritesByGroupIdAsync(groupId2)).resolves.toHaveLength(0);
            });
        });
    });
});
