import React from "react";
import { initTestFirestore, deleteFirebaseAppsAsync } from "../../__tests__/utils/firebase";
import { Store } from "../../stores/root-store";
import { render, waitFor } from "@testing-library/react";
import { ExportPage } from ".";

const {
    firestore,
    clearFirestoreDataAsync,
} = initTestFirestore("export-page-test",
    [
        "registrations",
    ]);

const store = new Store({
    firestore,
});

jest.mock("../../contexts/store-context", () => ({
    useStore: () => store,
}));

jest.mock("../../contexts/user-context", () => ({
    useUserStore: jest.fn().mockReturnValue({
        authenticatedUser: {},
    }),
}));

jest.mock("../../rules");
jest.mock("../../routes/registrations/detail");


beforeAll(clearFirestoreDataAsync);
afterAll(() => {
    store.dispose();
    return Promise.all([
        deleteFirebaseAppsAsync(),
    ])
});

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

describe("Export Page", () => {
    it("should render without registrations", () => {
        const { asFragment } = render(<ExportPage />);

        expect(asFragment()).toMatchSnapshot();
    });

    it("should display report for the specified month", async () => {
        store.view.setViewDate({
            year: 2020,
            month: 3,
        });

        store.user.setUser({ uid: "user-1" } as firebase.User);

        const {
            asFragment,
            getByText,
            container,
        } = render(<ExportPage />);

        await waitFor(() => expect(getByText("April")));

        const regIds = await store.timesheets.addRegistrationsAsync(registrations);

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

        await store.timesheets.deleteRegistrationsAsync(...regIds);

        await waitFor(() => expect(asFragment()).toMatchSnapshot());
    });
});
