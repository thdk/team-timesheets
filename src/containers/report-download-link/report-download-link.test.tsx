import React from "react";
import { transaction } from "mobx";
import { initTestFirestore, deleteFirebaseAppsAsync } from "../../__tests__/utils/firebase";
import { Store } from "../../stores/root-store";
import { TestCollection } from "../../__tests__/utils/firestorable/collection";
import { waitFor, render } from "@testing-library/react";
import { ReportDownloadLink } from "./report-download-link";

jest.mock("../../contexts/firebase-context", () => ({
    useFirebase: () => ({
        storage: () => ({
            ref: (path: string) => ({
                getDownloadURL: () => {
                    return new Promise(resolve => {
                        resolve(path);
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
        userRef,
    ]
} = initTestFirestore("report-download-link-test",
    [
        "users",
    ]);

const store = new Store({
    firestore,
});

jest.mock("../../contexts/store-context", () => ({
    useStore: () => store,
}));

const userCollection = new TestCollection(firestore, userRef);

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
beforeAll(setupAsync);
afterAll(() => {
    store.dispose();
    return Promise.all([
        deleteFirebaseAppsAsync(),
    ])
});

describe("ReportDownloadLink", () => {
    beforeEach(() => {
        transaction(() => {
            store.user.setUser({
                uid: "user-1",
                displayName: "user 1",
                email: "email@email.com",
            } as firebase.User);
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

    // it("should display report status and download link when report is completed", async () => {
    //     const { findByText, asFragment } = render(
    //         <ReportDownloadLink />
    //     );

    //     // Request a report
    //     store.reports.requestReport("user-1", 2020, 4);

    //     // Report status should be updated to 'waiting'
    //     await findByText("waiting");

    //     // Set report status as completed in collection
    //     // TODO: Setup firebase functions emulator so we don't have to fake this here
    //     await act(async () => {
    //         await store.reports.reports.updateAsync(
    //             { status: "complete" },
    //             store.reports.report!.id
    //         );
    //     });

    //     // The download url is fetched and should be displayed when finished
    //     await waitFor(() => {
    //         findByText("Download report");
    //     });

    //     // Cleanup
    //     await waitFor(() => expect(store.reports.report?.id).toBeDefined());
    //     await store.reports.reports.deleteAsync(store.reports.report!.id);
    //     await waitFor(() => expect(asFragment()).toMatchSnapshot());
    // });

    it("should not crash when report is deleted in database", async () => {
        const { findByText, queryByText } = render(
            <ReportDownloadLink />
        );

        store.reports.requestReport("user-1", 2020, 4);

        // Report status should be updated to 'waiting'
        await findByText("waiting");

        // Cleanup
        await store.reports.reports.deleteAsync(store.reports.report!.id);
        await waitFor(() => expect(queryByText("waiting")).toBeNull());
    });
});
