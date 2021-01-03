import fs from "fs";
import path from "path";

import React from "react";
import type firebase from "firebase";

import { Store } from "../../stores/root-store";
import { render, waitFor } from "@testing-library/react";
import { ExportPage } from ".";
import { initializeTestApp, clearFirestoreData, loadFirestoreRules } from "@firebase/rules-unit-testing";
import { useStore } from "../../contexts/store-context";

const projectId = "export-page-test";
let store: Store;
const app = initializeTestApp({ projectId });

const setupAsync = async () => {
    store = new Store({
        firestore: app.firestore(),
    });

    return store;
};


jest.mock("../../contexts/user-context");
jest.mock("../../contexts/auth-context");

jest.mock("../../rules");
jest.mock("../../routes/registrations/detail");

const registrations = [
    {
        date: new Date(2020, 2, 1),
        userId: "user-1",
        project: "project-1",
        task: "task-1",
        time: 4.5,
        isPersisted: true,
        description: "Foobar 1",
    },
    {
        date: new Date(2020, 2, 2),
        userId: "user-1",
        project: "project-1",
        task: "task-1",
        time: 4.5,
        isPersisted: true,
        description: "Foobar 2",
    },
    {
        date: new Date(2020, 2, 24),
        userId: "user-1",
        project: "project-1",
        task: "task-1",
        time: 2,
        isPersisted: true,
        description: "Foobar 3",
    },
    {
        date: new Date(2020, 2, 24),
        userId: "user-1",
        project: "project-2",
        task: "task-1",
        time: 2,
        isPersisted: true,
        description: "Foobar 4",
    },
    {
        date: new Date(2020, 2, 24),
        userId: "user-1",
        project: "project-2",
        task: "task-2",
        time: 6,
        isPersisted: true,
        description: "Foobar 5",
    },
    {
        date: new Date(2020, 3, 1),
        userId: "user-1",
        project: "project-1",
        task: "task-1",
        time: 2.5,
        isPersisted: true,
        description: "Another month"
    },
];

jest.mock("../../contexts/store-context");

beforeAll(() => loadFirestoreRules({
    projectId,
    rules: fs.readFileSync(path.resolve(__dirname, "../../../firestore.rules.test"), "utf8"),
}));

beforeEach(async () => {
    store = await setupAsync();
    (useStore as jest.Mock<ReturnType<typeof useStore>>).mockReturnValue(store);
});

afterEach(async () => {
    await store.dispose();
    await clearFirestoreData({ projectId });
});

afterAll(() => app.delete());

describe("Export Page", () => {
    it("should render without registrations", async () => {
        store.view.setViewDate({
            year: 2020,
            month: 9,
        });

        const { container, getByText, unmount, } = render(<ExportPage />);

        await waitFor(() => expect(getByText("Total in September")));

        const items = container.querySelectorAll(".grouped-registration-header-date");
        expect(
            items.length
        ).toBe(0);

        unmount();
    });

    it("should display report for the specified month", async () => {
        store.view.setViewDate({
            year: 2020,
            month: 3,
        });

        store.auth.setUser({ uid: "user-1" } as firebase.User);

        const {
            getByText,
            container,
            unmount,
        } = render(<ExportPage />);

        await waitFor(() => expect(getByText("April")));

        await store.timesheets.addDocuments(registrations);

        await waitFor(() => expect(getByText("Foobar 5")));

        let items = container.querySelectorAll(".grouped-registration-header-date");
        expect(
            items.length
        ).toBe(3);

        expect(Array.from(items).map(el => (el as HTMLElement).textContent))
            .toEqual([
                "March 1st",
                "March 2nd",
                "March 24th",
            ]);

        unmount();
    });
});
