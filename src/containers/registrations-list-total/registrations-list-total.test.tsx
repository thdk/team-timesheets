import React from "react";
import { initTestFirestore, deleteFirebaseAppsAsync } from "../../__tests__/utils/firebase";
import { Store } from "../../stores/root-store";
import { TestCollection } from "../../__tests__/utils/firestorable/collection";
import { IRegistrationData } from "../../../common";
import { waitFor, render } from "@testing-library/react";
import { RegistrationsListTotal } from "./registrations-list-total";
import { StoreProvider } from "../../contexts/store-context";
import { transaction } from "mobx";

const {
    firestore,
    clearFirestoreDataAsync,
    refs: [
        registrationRef,
        userRef,
    ]
} = initTestFirestore("registrations-list-total-test",
    [
        "registrations",
        "users",
    ]);

const userCollection = new TestCollection(firestore, userRef);
const registrationCollection = new TestCollection<IRegistrationData>(firestore, registrationRef);

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
        registrationCollection.addAsync([
            {
                userId: "user-1",
                description: "desc 0",
                date: new Date(2020, 3, 1),
                time: 1,
                isPersisted: true,
                created: new Date(2020, 3, 1, 15, 50, 0),
            },
            {
                userId: "user-1",
                description: "desc 1",
                date: new Date(2020, 3, 4),
                time: 3,
                isPersisted: true,
                created: new Date(2020, 3, 4, 7, 50, 0),
            },
            {
                userId: "user-1",
                description: "desc 2",
                date: new Date(2020, 3, 4),
                time: 2.5,
                isPersisted: true,
                created: new Date(2020, 3, 4, 7, 51, 0),
            },
            {
                userId: "user-1",
                description: "desc 3",
                date: new Date(2020, 3, 7),
                time: 2.5,
                isPersisted: true,
            },
        ] as any as IRegistrationData[]),
        registrationCollection.addAsync(
            {
                userId: "user-1",
                description: "desc 3",
                date: new Date(2020, 3, 9),
                time: 4.50,
                isPersisted: true,
                created: new Date(2020, 3, 9, 17, 50, 0),
            } as any as IRegistrationData,
            "reg-1",
        ),
        registrationCollection.addAsync(
            {
                userId: "user-1",
                description: "desc 4",
                date: new Date(2020, 5, 9),
                time: 4.50,
                isPersisted: true,
                created: new Date(2020, 5, 9, 17, 50, 0),
            } as any as IRegistrationData,
            "reg-2",
        )
    ]);
};

const store = new Store({
    firestore,
});

beforeAll(clearFirestoreDataAsync);
beforeAll(() => {
    setupAsync();
});
afterAll(() => {
    store.dispose();
    return Promise.all([
        deleteFirebaseAppsAsync(),
    ])
});

describe("RegistrationsListTotal", () => {
    beforeEach(() => {
        transaction(() => {
            store.user.setUser({ uid: "user-1", displayName: "user 1" } as firebase.User);
            store.view.setViewDate({
                year: 2020,
                month: 4,
                day: 1,
            });
        });
    });

    it("should display total time", async () => {
        const { getByText } = render(
            <StoreProvider testStore={store}>
                <RegistrationsListTotal />
            </StoreProvider>
        );

        await waitFor(() => {
            expect(getByText("Total in April"));
            expect(getByText("13.5 hours"));
        });
    });

    it("rerenders when view date changes", async () => {
        store.view.setViewDate({
            year: 2020,
            month: 1,
        });

        const { getByText } = render(
            <StoreProvider testStore={store}>
                <RegistrationsListTotal />
            </StoreProvider>
        );

        await waitFor(() => {
            expect(getByText("Total in January"));
            expect(getByText("0 hours"));
        });

        store.view.setViewDate({
            year: 2020,
            month: 6,
        });

        await waitFor(() => {
            expect(getByText("Total in June"));
            expect(getByText("4.5 hours"));
        });
    });
});
