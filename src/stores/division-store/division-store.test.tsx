import type firebase from "firebase";
import fs from "fs";
import path from "path";

import { Store } from "../root-store";
import { reaction } from "mobx";
import { waitFor } from "@testing-library/react";
import { loadFirestoreRules, initializeTestApp, clearFirestoreData, } from "@firebase/rules-unit-testing";
const projectId = "division-store-test";
const app = initializeTestApp({
    projectId,
});

const getDivisionByEntryCode = jest.fn().mockRejectedValue("error");
const httpsCallable = jest.fn(() => getDivisionByEntryCode);
let store: Store;
const setupAsync = async () => {
    store = new Store({
        firestore: app.firestore(),
        httpsCallable,
    });

    await Promise.all([
        store.user.usersCollection.addAsync(
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
    ]).then(() => {
        store.auth.setUser({
            uid: "user-1",
        } as firebase.User);
    });

    return store;
};

beforeAll(() => loadFirestoreRules({
    projectId,
    rules: fs.readFileSync(path.resolve(__dirname, "../../../firestore.rules.test"), "utf8"),
}));

beforeEach(async () => {
    store = await setupAsync();
});

afterEach(() => clearFirestoreData({ projectId }));

afterAll(() => app.delete());

describe("DivisionStore", () => {
    let unsubscribe: () => void;

    beforeEach(() => {

        // We need to observe something otherwise registrations aren't fetched :)
        unsubscribe = reaction(() => store.user.divisionUsersCollection, () => { });
    });

    afterEach(() => {
        unsubscribe();
    });

    describe("userDivisions", () => {
        describe("when there are no division users", () => {
            it("should return an empty array", () => {
                expect(store.divisions.userDivisions.length).toBe(0);
            });
        });

        describe("when there are division users", () => {
            beforeEach(async () => {
                await Promise.all(
                    [
                        store.divisions.addDocument(
                            {
                                name: "Division 1",
                                createdBy: "user-1",
                                icon: "business",
                                id: "div-1"
                            },
                            "div-1"
                        ),
                        store.divisions.addDocument(
                            {
                                name: "Division 2",
                                createdBy: "user-2",
                                icon: "house",
                                id: "div-2"
                            },
                            "div-2",
                        )]).then(async () => {
                            await store.user.divisionUsersCollection.addAsync([
                                {
                                    name: "User 1",
                                    divisionId: "div-1",
                                    tasks: new Map<string, true>(),
                                    recentProjects: [] as string[],
                                    uid: "user-1",
                                    roles: {}
                                },
                                {
                                    name: "User 1",
                                    divisionId: "div-2",
                                    tasks: new Map<string, true>(),
                                    recentProjects: [] as string[],
                                    uid: "user-1",
                                    roles: {}
                                },
                            ])
                        });

            });

            it("should return an array of division users", async () => {
                await waitFor(() => expect(store.user.divisionUsersCollection.isFetched).toBeTruthy());
                await waitFor(() => expect(store.divisions.userDivisions.length).toBe(2));
            });
        });
    });

    describe("joinDivision", () => {
        it("should return a success message", async () => {
            getDivisionByEntryCode.mockResolvedValue(
                { data: "div-1" },
            );

            const successMessage = "Successfully joined this division";

            await waitFor(() => expect(store.user.authenticatedUser).toBeDefined());

            await expect(
                store.divisions.joinDivision("entry-code"),
            ).resolves.toEqual(successMessage);
        });

        it("should return an error message when no division exists for entry code", async () => {
            getDivisionByEntryCode.mockResolvedValue(
                { data: undefined },
            );

            const errorMessage = "You can't join this division";

            await expect(
                store.divisions.joinDivision("invalid-entry-code"),
            ).rejects.toEqual(errorMessage);
        });

        it("should return an error message when user is already in the division", async () => {
            await store.divisions.addDocument(
                {
                    name: "Division 1",
                    createdBy: "user-1",
                    icon: "business",
                    id: "div-1"
                },
                "div-1"
            ).then(async () => {
                await store.user.divisionUsersCollection.addAsync(
                    {
                        name: "User 1",
                        divisionId: "div-1",
                        tasks: new Map<string, true>(),
                        recentProjects: [] as string[],
                        uid: "user-1",
                        roles: {}
                    },
                    "div-user-1",
                );
            });

            await waitFor(() => expect(store.user.authenticatedUser).toBeDefined());

            getDivisionByEntryCode.mockResolvedValue(
                { data: "div-1" },
            );

            const errorMessage = "You are already in this division";

            await expect(
                store.divisions.joinDivision("entry-code"),
            ).rejects.toEqual(errorMessage);
        });
    });
});