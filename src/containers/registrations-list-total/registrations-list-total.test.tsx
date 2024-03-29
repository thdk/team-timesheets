import path from "path";
import fs from "fs";
import React from "react";

import { Store } from "../../stores/root-store";
import { waitFor, render } from "@testing-library/react";
import { RegistrationsListTotal } from "./registrations-list-total";
import { StoreProvider } from "../../contexts/store-context";
import { RulesTestEnvironment, initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { User } from "firebase/auth";

const projectId = "registrations-list-total-test";

let store: Store;
const setupAsync = async () => {
    store = new Store({
        firestore,
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
                githubRepos: [],
            },
            "user-1",
        ),
        store.timesheets.addDocument(
            {
                userId: "user-1",
                description: "desc 0",
                date: new Date(2020, 3, 1),
                time: 1,
                created: new Date(2020, 3, 1, 15, 50, 0),
                isPersisted: true,
            },
        ),
        store.timesheets.addDocument({
            userId: "user-1",
            description: "desc 1",
            date: new Date(2020, 3, 4),
            time: 3,
            created: new Date(2020, 3, 4, 7, 50, 0),
            isPersisted: true,
        },
        ),
        store.timesheets.addDocument({
            userId: "user-1",
            description: "desc 2",
            date: new Date(2020, 3, 4),
            time: 2.5,
            created: new Date(2020, 3, 4, 7, 51, 0),
            isPersisted: true,
        }),
        store.timesheets.addDocument({
            userId: "user-1",
            description: "desc 3",
            date: new Date(2020, 3, 7),
            time: 2.5,
            isPersisted: true,
        }),
        store.timesheets.addDocument(
            {
                userId: "user-1",
                description: "desc 3",
                date: new Date(2020, 3, 9),
                time: 4.50,
                created: new Date(2020, 3, 9, 17, 50, 0),
                isPersisted: true,
            },
            "reg-1",
        ),
        store.timesheets.addDocument(
            {
                userId: "user-1",
                description: "desc 4",
                date: new Date(2020, 5, 9),
                time: 4.50,
                isPersisted: true,
                created: new Date(2020, 5, 9, 17, 50, 0),
            },
            "reg-2",
        ),
    ]);

    store.auth.setUser({
        uid: "user-1",
        displayName: "user 1",
        email: "email@email.com",
    } as User);
    store.view.setViewDate({
        year: 2020,
        month: 4,
        day: 1,
    });
};

let testEnv: RulesTestEnvironment | undefined;
let firestore: any;

beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
        projectId,
        firestore: {
            rules: fs.readFileSync(path.resolve(__dirname, "../../../firestore.rules.test"), "utf8"),
        }
    }).catch((e) => {
        console.error(e);
        return undefined;
    });

    firestore = testEnv && testEnv.unauthenticatedContext().firestore();
});

beforeEach(async () => {
    return setupAsync().catch((e) => console.error(e));
});

afterEach(async () => {
    store.dispose();
    testEnv && await testEnv.clearFirestore();
});

afterAll(() => testEnv && testEnv.cleanup());

describe("RegistrationsListTotal", () => {
    it("should display total time", async () => {
        const { getByText, unmount } = render(
            <StoreProvider testStore={store}>
                <RegistrationsListTotal />
            </StoreProvider>
        );

        await waitFor(() => {
            expect(getByText("Total in April"));
            expect(getByText("13.5 hours"));
        });

        unmount();
    });

    it("rerenders when view date changes", async () => {
        store.view.setViewDate({
            year: 2020,
            month: 1,
        });

        const { getByText, unmount } = render(
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

        unmount();
    });
});
