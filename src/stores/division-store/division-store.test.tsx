import { Store } from "../root-store";
import { initTestFirestore, deleteFirebaseAppsAsync } from "../../__tests__/utils/firebase";
import { TestCollection } from "../../__tests__/utils/firestorable/collection";
import { IDivision } from "../../../common/interfaces/IOrganisation";
import { IDivisionUserData, IUser } from "../../../common";
import * as serializer from '../../../common/serialization/serializer';
import { IDivisionData } from "../../../common/interfaces/IOrganisationData";
import { reaction } from "mobx";
import { waitFor } from "@testing-library/react";

const {
    firestore,
    clearFirestoreDataAsync,
    refs: [
        userRef,
        divisionRef,
        divisionUserRef,

    ]
} = initTestFirestore("division-store-test",
    [
        "users",
        "divisions",
        "division-users",
    ]);

const userCollection = new TestCollection(
    firestore,
    userRef,
);
const divisionCollection = new TestCollection<IDivision, IDivisionData>(
    firestore,
    divisionRef,
    {
        serialize: serializer.convertDivision,
    },
);

const divisionUserCollection = new TestCollection<IUser, IDivisionUserData>(
    firestore,
    divisionUserRef,
    {
        serialize: serializer.convertUser,
        defaultSetOptions: {
            merge: true,
        },
    },
);

const getDivisionByEntryCode = jest.fn().mockRejectedValue("error");
const httpsCallable = jest.fn(() => getDivisionByEntryCode);
const store = new Store({ firestore, httpsCallable });

const setupAsync = () => {
    return Promise.all([
        userCollection.addAsync(
            {
                name: "user 1",
                team: "team-1",
                roles: {
                    user: true,
                }
            },
            "user-1",
        ),
    ]).then(() => {
        store.auth.setUser({
            uid: "user-1",
        } as firebase.User);
    });
};

beforeAll(() => Promise.all([
    clearFirestoreDataAsync(),
    setupAsync(),
]));

afterAll(deleteFirebaseAppsAsync);

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
            let divisionIds: string[];
            beforeAll(async () => {
                await Promise.all(
                    [
                        divisionCollection.addAsync(
                            {
                                name: "Division 1",
                                createdBy: "user-1",
                                icon: "business",
                                id: "div-1"
                            },
                            "div-1"
                        ),
                        divisionCollection.addAsync(
                            {
                                name: "Division 2",
                                createdBy: "user-2",
                                icon: "house",
                                id: "div-2"
                            },
                            "div-2",
                        )]).then(async (ids) => {
                            divisionIds = ids;
                            await divisionUserCollection.addAsync([
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

            afterAll(() => {
                return divisionCollection.deleteAsync(...divisionIds);
            });

            it("should return an array of division users", async () => {
                await waitFor(() => expect(store.user.divisionUsersCollection.isFetched).toBeTruthy());
                await waitFor(() => expect(store.divisions.userDivisions.length).toBe(2));
            });
        });
    });

    describe("joinDivision", () => {
        it("should return a success message", async () => {
            getDivisionByEntryCode.mockResolvedValueOnce(
                { data: "div-1" },
            );

            const successMessage = "Successfully joined this division";

            await expect(
                store.divisions.joinDivision("entry-code"),
            ).resolves.toEqual(successMessage);
        });

        it("should return an error message when no division exists for entry code", async () => {
            getDivisionByEntryCode.mockResolvedValueOnce(
                { data: undefined },
            );

            const errorMessage = "You can't join this division";

            await expect(
                store.divisions.joinDivision("invalid-entry-code"),
            ).rejects.toEqual(errorMessage);
        });

        it("should return an error message when user is already in the division", async () => {
            await divisionCollection.addAsync(
                {
                    name: "Division 1",
                    createdBy: "user-1",
                    icon: "business",
                    id: "div-1"
                },
                "div-1"
            ).then(async () => {
                await divisionUserCollection.addAsync(
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

            getDivisionByEntryCode.mockResolvedValueOnce(
                { data: "div-1" },
            );

            const errorMessage = "You are already in this division";

            await expect(
                store.divisions.joinDivision("entry-code"),
            ).rejects.toEqual(errorMessage);

            await divisionCollection.deleteAsync("div-1");
            await divisionUserCollection.deleteAsync("div-user-1");
        });
    });
});