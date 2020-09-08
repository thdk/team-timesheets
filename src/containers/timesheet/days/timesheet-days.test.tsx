import React from "react";


import { initTestFirestore, deleteFirebaseAppsAsync } from "../../../__tests__/utils/firebase";
import { Store } from "../../../stores/root-store";
import { render, waitFor, fireEvent } from "@testing-library/react";
import { TimesheetDays, SortOrder } from ".";
import { Timesheet } from "..";
import { goToNewRegistration } from "../../../routes/registrations/detail";

const {
    firestore,
    clearFirestoreDataAsync,
} = initTestFirestore("timesheet-test",
    [
        "registrations",
    ]);

const store = new Store({
    firestore,
});

jest.mock("../../../contexts/store-context", () => ({
    useStore: () => store,
}));

jest.mock("../../google-calendar");

jest.mock("../../../rules");
jest.mock("../../../routes/registrations/detail");

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

describe("TimesheetDays", () => {
    it("should render without registrations", () => {
        const { asFragment } = render(<TimesheetDays
            isMonthView={false}
            registrationClick={jest.fn()}
        />);

        expect(asFragment()).toMatchSnapshot();
    });

    it("should display registrations for the specified month", async () => {
        store.view.setViewDate({
            year: 2020,
            month: 3,
        });

        store.user.setUser({ uid: "user-1" } as firebase.User);


        const {
            asFragment,
            getByText,
            container,
            queryByText
        } = render(<Timesheet />);

        expect(queryByText("Foobar 5")).toBeFalsy();

        const regIds = await store.timesheets.addRegistrationsAsync(registrations);

        await waitFor(() => expect(getByText("Foobar 5")));

        let items = container.querySelectorAll(".grouped-registration-header-date");
        expect(
            items.length
        ).toBe(3);

        expect(Array.from(items).map(el => (el as HTMLElement).textContent))
            .toEqual([
                "March 24th",
                "March 2nd",
                "March 1st",
            ]);

        store.timesheets.setRegistrationsGroupedByDaySortOrder(SortOrder.Ascending);

        await waitFor(() => expect(Array.from(container.querySelectorAll(".grouped-registration-header-date")).map(el => (el as HTMLElement).textContent))
            .toEqual([
                "March 1st",
                "March 2nd",
                "March 24th",
            ])
        );

        store.timesheets.setRegistrationsGroupedByDaySortOrder(SortOrder.Descending);

        await store.timesheets.deleteRegistrationsAsync(...regIds);


        await waitFor(() => expect(asFragment()).toMatchSnapshot());
    });

    it("should display registrations for the specified day", async () => {
        store.view.setViewDate({
            year: 2020,
            month: 3,
            day: 24,
        });

        store.user.setUser({ uid: "user-1" } as firebase.User);

        const {
            asFragment,
            getByText,
            queryByText,
            container,
        } = render(<Timesheet />);

        expect(queryByText("Foobar 5")).toBeFalsy();

        const regIds = await store.timesheets.addRegistrationsAsync(registrations);

        await waitFor(() => expect(getByText("Foobar 5")));

        const items = container.querySelectorAll(".grouped-registration-header");
        expect(
            items.length
        ).toBe(1);

        const registrationItems = container.querySelectorAll(".registration-line");
        expect(
            registrationItems.length
        ).toBe(3);

        await store.timesheets.deleteRegistrationsAsync(...regIds);

        await waitFor(() => expect(asFragment()).toMatchSnapshot());
    });
    it("should unfold registration when header is clicked", async () => {
        store.view.setViewDate({
            year: 2020,
            month: 3,
        });

        store.user.setUser({ uid: "user-1" } as firebase.User);

        const {
            asFragment,
            getByText,
            queryByText,
            container,
        } = render(<Timesheet />);

        expect(queryByText("Foobar 5")).toBeFalsy();

        const regIds = await store.timesheets.addRegistrationsAsync(registrations);

        await waitFor(() => expect(getByText("Foobar 5")));

        const headerEls = container.querySelectorAll(".grouped-registration-header");
        expect(
            headerEls.length
        ).toBe(3);

        fireEvent.click(headerEls[1]);

        await waitFor(() => expect(getByText("Foobar 2")));

        await store.timesheets.deleteRegistrationsAsync(...regIds);

        await waitFor(() => expect(asFragment()).toMatchSnapshot());
    });

    it("should NOT unfold registration when header add button is clicked", async () => {
        store.view.setViewDate({
            year: 2020,
            month: 3,
        });

        store.user.setUser({ uid: "user-1" } as firebase.User);

        const {
            asFragment,
            getByText,
            queryByText,
            container,
        } = render(<Timesheet />);

        expect(queryByText("Foobar 5")).toBeFalsy();

        const regIds = await store.timesheets.addRegistrationsAsync(registrations);

        await waitFor(() => expect(getByText("Foobar 5")));

        const headerAddButtonEls = container.querySelectorAll(".grouped-registration-header-add-button");
        expect(
            headerAddButtonEls.length
        ).toBe(3);

        fireEvent.click(headerAddButtonEls[1]);

        await waitFor(() => expect(goToNewRegistration).toBeCalled());

        await store.timesheets.deleteRegistrationsAsync(...regIds);

        await waitFor(() => expect(asFragment()).toMatchSnapshot());
    });
});
