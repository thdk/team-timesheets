import { initTestFirestore, deleteFirebaseAppsAsync } from "../../__tests__/utils/firebase";

import React from "react";
import { TestCollection } from "../../__tests__/utils/firestorable/collection";
import firebase from "firebase/app";
import { waitFor } from "@testing-library/react";
import { reaction, transaction } from "mobx";
import { Store } from "../root-store";
import { IReport } from "../../../common";
// import { IReport } from "../../../common";

jest.mock("@material/top-app-bar/index", () => ({
    MDCTopAppBar: () => React.Fragment,
}));

jest.mock("@material/icon-button/index", () => ({
    MDCIconButtonToggle: () => React.Fragment,
}));

jest.mock("@material/tab-bar/index", () => ({
    MDCTabBar: () => React.Fragment,
}));

jest.mock("@material/ripple/index", () => ({
    MDCRipple: () => React.Fragment,
}));

jest.mock("@material/switch/index", () => ({
    MDCSwitch: () => React.Fragment,
}));


const {
    firestore,
    clearFirestoreDataAsync,
    refs: [
        reportsRef,
        userRef,
    ]
} = initTestFirestore("reports-store-test",
    [
        "reports",
        "users",
    ]);

const userCollection = new TestCollection(firestore, userRef);
const reportsCollection = new TestCollection<IReport>(firestore, reportsRef);

const store = new Store({ firestore });

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
    ]);
};

beforeAll(() => Promise.all([
    clearFirestoreDataAsync(),
    setupAsync(),
]));

afterAll(deleteFirebaseAppsAsync);

describe("ReportStore", () => {
    let unsubscribe: () => void;

    beforeAll(() => {
        transaction(() => {
            store.user.setUser({ uid: "user-1", displayName: "user 1" } as firebase.User);
            store.view.setViewDate({
                year: 2020,
                month: 4,
                day: 1,
            });
        });
        unsubscribe = reaction(() => store.reports.report, () => { })
    });

    afterAll(() => unsubscribe());

    describe("report", () => {
        it("should be undefined when there is no report for current user or date", async () => {
            await waitFor(() => expect(store.reports.reports.isFetched).toBe(true));

            expect(store.reports.report).toBe(undefined);
        });
    });

    describe("requestReport", () => {
        it("should add a report in the database", async () => {
            store.reports.requestReport("user-1", 2020, 4);

            await waitFor(() => {
                expect(store.reports.report).toBeDefined();
                expect(store.reports.report!.data).toEqual(
                    expect.objectContaining({
                        userId: "user-1",
                        year: 2020,
                        month: 4,
                    }),
                );
            });

            await reportsCollection.deleteAsync(store.reports.report!.id);
        });
    });
});
