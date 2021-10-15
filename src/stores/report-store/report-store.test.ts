import fs from "fs";
import path from "path";
import { waitFor } from "@testing-library/react";
import { reaction, transaction } from "mobx";
import { Store } from "../root-store";
import { clearFirestoreData, initializeTestApp, loadFirestoreRules } from "@firebase/rules-unit-testing";
import { User } from "firebase/auth";

const projectId = "reports-store-test";
const app = initializeTestApp({
    projectId,
});

let store: Store;
const setupAsync = () => {
    store = new Store({
        firestore: app.firestore(),
    });

    return Promise.all([
        store.user.usersCollection.addAsync(
            {
                name: "user 1",
                email: "email@email.com",
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
    ]);
};

beforeAll(async () => {
    await loadFirestoreRules({
        projectId,
        rules: fs.readFileSync(path.resolve(__dirname, "../../../firestore.rules.test"), "utf8"),
    })
});

beforeEach(() => setupAsync());

afterEach(async () => {
    store.dispose();
    await clearFirestoreData({
        projectId,
    });
});

afterAll(() => app.delete());

describe("ReportStore", () => {
    let unsubscribe: () => void;

    beforeEach(() => {
        transaction(() => {
            store.auth.setUser({
                uid: "user-1",                
            } as User);
            store.view.setViewDate({
                year: 2020,
                month: 4,
                day: 1,
            });
        });
        unsubscribe = reaction(() => store.reports.report, () => { })
    });

    afterEach(() => unsubscribe());

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
        });
    });
});
