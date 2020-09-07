import React from "react";
import { initTestFirestore, deleteFirebaseAppsAsync } from "../../__tests__/utils/firebase";
import { Store } from "../../stores/root-store";
import { TestCollection } from "../../__tests__/utils/firestorable/collection";
import { IReport } from "../../../common";
import { waitFor, render } from "@testing-library/react";
import { transaction } from "mobx";
import { ReportDownloadLink } from "./report-download-link";
import { act } from "react-dom/test-utils";

jest.mock("../../contexts/firebase-context", () => ({
    useFirebase: () => ({
        storage: () => ({
            ref: (path: string) => ({
                getDownloadURL: () => {
                    return new Promise(resolve => {
                        setTimeout(() => resolve(path), 50);
                    });
                },
            }),
        }),
    })
}));

const {
    firestore,
    clearFirestoreDataAsync,
    refs: [
        reportRef,
        userRef,
    ]
} = initTestFirestore("report-download-link-test",
    [
        "reports",
        "users",
    ]);

const store = new Store({
    firestore,
});

jest.mock("../../contexts/store-context", () => ({
    useStore: () => store,
}));

const userCollection = new TestCollection(firestore, userRef);
const reportsCollection = new TestCollection<IReport>(firestore, reportRef);


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

describe("ReportDownloadLink", () => {
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

    it("should not render when there is no report", async () => {
        const { asFragment } = render(
            <ReportDownloadLink />
        );

        await waitFor(() => expect(asFragment()).toMatchSnapshot());
    });

    it("should display report status and download link when report is completed", async () => {
        const { findByText, asFragment } = render(
            <ReportDownloadLink />
        );

        // Request a report
        store.reports.requestReport("user-1", 2020, 4);

        // Report status should be updated to 'waiting'
        await findByText("waiting", undefined, {
            interval: 100,
            timeout: 1000,
        });

        // Set report status as completed in collection
        // TODO: Setup firebase functions emulator so we don't have to fake this here
        await act(async () => {
            return reportsCollection.updateAsync({ status: "complete" }, store.reports.report!.id)
                .then(() => { /* voidify */ });
        });

        // The download url is fetched and should be displayed when finished
        await findByText("Download report");

        // Cleanup
        await reportsCollection.deleteAsync(store.reports.report!.id);
        await waitFor(() => expect(asFragment()).toMatchSnapshot());
    });

    it("should not crash when report is deleted in database", async () => {
        store.reports.requestReport("user-1", 2020, 4);

        const { findByText, asFragment } = render(
            <ReportDownloadLink />
        );

        // Report status should be updated to 'waiting'
        await findByText("waiting");

        // Cleanup
        await reportsCollection.deleteAsync(store.reports.report!.id);
        await waitFor(() => expect(asFragment()).toMatchSnapshot());
    });
});
