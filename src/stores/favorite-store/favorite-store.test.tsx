import { Store } from "../root-store";
import path from "path";
import fs from "fs";
import type firebase from "firebase";
import { waitFor } from "@testing-library/react";
import { initializeTestApp, loadFirestoreRules, clearFirestoreData, } from "@firebase/rules-unit-testing";
import { useStore } from "../../contexts/store-context";
import { IFavoriteRegistration } from "../../../common";

jest.mock("../../contexts/store-context");

const projectId = "favorite-store-test";
const app = initializeTestApp({
    projectId,
});


let divisionUserId1: string;
let divisionUserId2: string;
const divisionId1 = "div-1";
const divisionId2 = "div-2";

let store: Store;
const setupAsync = async () => {
    store = new Store({
        firestore: app.firestore(),
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
            },
            "user-1",
        ),
        store.divisions.addDocuments([
            {
                name: "Division 1",
                createdBy: "user-1",
                icon: "business",
                id: divisionId1
            },
            {
                name: "Division 2",
                createdBy: "user-2",
                icon: "house",
                id: divisionId2
            },
        ]),
    ]);

    const [
        generatedDivisionUserId1,
        generatedDivisionUserId2,
    ] = await store.user.divisionUsersCollection.addAsync([
        {
            name: "Division User 1",
            divisionId: divisionId1,
            tasks: new Map<string, true>(),
            recentProjects: [] as string[],
            uid: "user-1",
            roles: {}
        },
        {
            name: "Division User 2",
            divisionId: divisionId2,
            tasks: new Map<string, true>(),
            recentProjects: [] as string[],
            uid: "user-1",
            roles: {}
        },
    ]);

    divisionUserId1 = generatedDivisionUserId1;
    divisionUserId2 = generatedDivisionUserId2;

    store.auth.setUser({
        uid: "user-1",
    } as firebase.User);
};

beforeAll(async () => {
    await loadFirestoreRules({
        projectId,
        rules: fs.readFileSync(path.resolve(__dirname, "../../../firestore.rules.test"), "utf8"),
    })
});

beforeEach(async () => {
    await setupAsync();
    (useStore as jest.Mock<ReturnType<typeof useStore>>).mockReturnValue(store);
});

afterEach(async () => {
    await store.dispose();
    await clearFirestoreData({
        projectId,
    });
});

afterAll(() => app.delete());

describe("FavoriteStore", () => {

    describe("groups", () => {
        describe("when there are no favorite groups", () => {
            it("should return an empty array", () => {
                expect(store.favorites.groups.length).toBe(0);
            });
        });

        describe("when there are favorite groups", () => {
            beforeEach(async () => {
                await store.favorites.addDocuments([
                    {
                        name: "Fav group 1",
                        userId: "user-1",
                    },
                    {
                        name: "Fav group 2",
                        userId: "user-1",
                    },
                    {
                        name: "Fav group 3",
                        userId: "user-1",
                    },
                    {
                        name: "Fav group 1",
                        userId: "user-2",
                    },
                    {
                        name: "Fav group 1 - div 1",
                        userId: divisionUserId1,
                    },
                    {
                        name: "Fav group 2 - div 1",
                        userId: divisionUserId1,
                    },
                    {
                        name: "Fav group 1 - div 2",
                        userId: divisionUserId2,
                    },
                ]);
            });

            it("should return an array of ", async () => {
                await waitFor(() => expect(store.user.divisionUser).toBeDefined());
                await waitFor(() => expect(store.favorites.groups.length).toBe(3));
            });

            it("should return only favorite groups of the current division user", async () => {
                await waitFor(() => expect(store.user.divisionUser).toBeDefined());

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
                await waitFor(() => expect(store.user.divisionUser).toBeDefined());
                groupId = store.favorites.addFavorites(
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
                    ).toBeDefined(),
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
            }
        );

        afterEach(
            async () => {
                store.favorites.deleteDocument(groupId, { useFlag: false });

                await waitFor(
                    () => expect(
                        store.favorites.groups.length
                    ).toBe(0),
                );

                const registrations = await store.favorites.getFavoritesByGroupIdAsync(groupId);

                await store.favorites.favoriteCollection.deleteAsync(...registrations.map((doc) => doc.id));

                await store.favorites.favoriteCollection.fetchAsync();

                await waitFor(
                    () => expect(
                        store.favorites.favoriteCollection.docs.length,
                    ).toBe(0),
                );
            },
        );

        it("can set a new name for the favorite group", async () => {
            if (store.favorites.activeDocument) {
                store.favorites.activeDocument.name = "New favorite group name";
            }

            store.favorites.saveFavoriteGroup();

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
            const groupId2 = store.favorites.addFavorites(
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
            store.favorites.saveFavoriteGroup();

            await waitFor(() => {
                expect(store.favorites.groups).toHaveLength(1);
            });

            store.favorites.deleteDocument(groupId2);
            store.favorites.favoriteCollection.deleteAsync(...registrations.map((reg) => reg.id));
            await store.favorites.favoriteCollection.fetchAsync();
            await waitFor(() => expect(store.favorites.groups).toHaveLength(0));
            await waitFor(() => {
                expect(store.favorites.getFavoritesByGroupIdAsync(groupId2)).resolves.toHaveLength(0);
            });
        });
    });

    // describe("addDocument", () => {
    //     it("should add a project", async () => {
    //         await waitFor(() => expect(store.user.divisionUser).toBeDefined());
    //         await waitFor(() => expect(store.projects.activeProjects.length).toBe(0));
    //         store.projects.addDocument(
    //             {
    //                 name: "New project 1",
    //                 createdBy: "user-1",
    //                 divisionId: "",
    //             },
    //             "new-project-1",
    //         );

    //         await waitFor(() => expect(store.projects.activeProjects.length).toBe(1));

    //         store.projects.deleteDocuments(
    //             {
    //                 useFlag: false,
    //             },
    //             "new-project-1",
    //         );

    //         await waitFor(() => expect(store.projects.activeProjects.length).toBe(0));
    //     });
    // });
});