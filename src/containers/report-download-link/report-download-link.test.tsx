import fs from "fs";
import path from "path";

import React from "react";
import type firebase from "firebase";
import { Store } from "../../stores/root-store";
import { waitFor, render } from "@testing-library/react";
import { ReportDownloadLink } from "./report-download-link";
import { StoreContext } from "../../contexts/store-context";
import { initializeTestApp, clearFirestoreData, loadFirestoreRules } from "@firebase/rules-unit-testing";

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

const projectId = "report-download-link-test";
const app = initializeTestApp({
    projectId,
    auth: {
        uid: "user-1",
    },
});

let store: Store;
const setupAsync = async () => {
    store = new Store({
        firestore: app.firestore(),
    });

    await Promise.all([
        store.user.usersCollection.addAsync(
            {
                name: "user 1",
                team: "team-1",
                email: "email@email.com",
                roles: {
                    recruit: true,
                },
                uid: "user-1",
                divisionId: "",
                recentProjects: [],
                tasks: new Map(),
            },
            "user-1",
        ),
    ]);

    store.auth.setUser({
        uid: "user-1",
        displayName: "user 1",
        email: "email@email.com",
    } as firebase.User);
    store.view.setViewDate({
        year: 2020,
        month: 4,
        day: 1,
    });
};

beforeAll(async () => {
    await loadFirestoreRules({
        projectId,
        rules: fs.readFileSync(path.resolve(__dirname, "../../../firestore.rules.test"), "utf8"),
    });
});

beforeEach(() => setupAsync());
afterEach(async () => {
    store.dispose();
    await clearFirestoreData({ projectId });
});

afterAll(() => app.delete());

describe("ReportDownloadLink", () => {

    it("should not render when there is no report", async () => {
        const { asFragment, unmount } = render(
            <StoreContext.Provider value={store}>
                <ReportDownloadLink />
            </StoreContext.Provider>
        );

        await waitFor(() => expect(asFragment()).toMatchSnapshot());

        unmount();
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
        const { findByText, unmount } = render(
            <StoreContext.Provider value={store}>
                <ReportDownloadLink />
            </StoreContext.Provider>
        );

        store.reports.requestReport("user-1", 2020, 4);

        // Report status should be updated to 'waiting'
        await findByText("waiting");

        unmount();
    });
});
