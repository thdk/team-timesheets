import React from "react";
import fs from "fs";
import path from "path";


import { Store } from "../../../stores/root-store";
import { render, waitFor, fireEvent } from "@testing-library/react";
import { TimesheetDays, SortOrder } from ".";
import { Timesheet } from "..";
import { goToNewRegistration } from "../../../routes/registrations/detail";
import { useStore } from "../../../contexts/store-context";
import { initializeTestEnvironment, RulesTestEnvironment, } from "@firebase/rules-unit-testing";
import { act } from "react-dom/test-utils";
import { User } from "firebase/auth";

jest.mock("../../google-calendar");

jest.mock("../../../rules");
jest.mock("../../../routes/registrations/detail");

jest.mock("../../../contexts/store-context");

const projectId = "timesheet-test";

let store: Store;

const setupAsync = async () => {
    store = new Store({
        firestore,
    });
    await store.user.usersCollection.addAsync(
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
        },
        "user-1",
    );

    store.auth.setUser({ uid: "user-1" } as User);

    return store;
};

let testEnv: RulesTestEnvironment;
let firestore: any;

beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
        projectId,
        firestore: {
            rules: fs.readFileSync(path.resolve(__dirname, "../../../../firestore.rules.test"), "utf8"),
        }
    });

    firestore = testEnv.unauthenticatedContext().firestore();
});

beforeEach(async () => {
    await setupAsync();
    (useStore as jest.Mock<ReturnType<typeof useStore>>).mockReturnValue(store);
});

afterEach(async () => {
    store.dispose();
    await testEnv.clearFirestore();
});

afterAll(() => testEnv.cleanup());

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
        const { asFragment, unmount } = render(<TimesheetDays
            isMonthView={false}
            registrationClick={jest.fn()}
        />);

        expect(asFragment()).toMatchSnapshot();

        unmount();
    });

    it("should display registrations for the specified month", async () => {
        store.view.setViewDate({
            year: 2020,
            month: 3,
        });

        await Promise.all(
            registrations.map(registration => store.timesheets.addDocument(registration))
        );
        await waitFor(() => expect(store.user.divisionUser?.id).toBeDefined());

        const {
            getByText,
            container,
            unmount,
        } = render(<Timesheet />);

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

        unmount();
    });

    it("should display registrations for the specified day", async () => {
        store.view.setViewDate({
            year: 2020,
            month: 3,
            day: 24,
        });

        store.auth.setUser({ uid: "user-1" } as User);

        await waitFor(() => expect(store.user.divisionUser).toBeDefined());

        await Promise.all(
            registrations.map(registration => store.timesheets.addDocument(registration))
        );

        const {
            getByText,
            container,
            unmount,
        } = render(<Timesheet />);

        await waitFor(() => expect(getByText("Foobar 5")));

        const items = container.querySelectorAll(".grouped-registration-header");
        expect(
            items.length
        ).toBe(1);

        const registrationItems = container.querySelectorAll(".registration-line");
        expect(
            registrationItems.length
        ).toBe(3);

        unmount();
    });
    it("should unfold registration when header is clicked", async () => {
        store.view.setViewDate({
            year: 2020,
            month: 3,
        });

        store.auth.setUser({ uid: "user-1" } as User);

        await waitFor(() => expect(store.user.divisionUser?.id).toBeDefined());

        await Promise.all(
            registrations.map(registration => store.timesheets.addDocument(registration))
        );

        const {
            getByText,
            container,
            unmount,
        } = render(<Timesheet />);

        await waitFor(() => expect(getByText("Foobar 5")));

        const headerEls = container.querySelectorAll(".grouped-registration-header");
        expect(
            headerEls.length
        ).toBe(3);

        act(() => {
            fireEvent.click(headerEls[1]);
        });

        await waitFor(() => expect(getByText("Foobar 2")));

        unmount();
    });

    it("should NOT unfold registration when header add button is clicked", async () => {
        store.view.setViewDate({
            year: 2020,
            month: 3,
        });

        store.auth.setUser({ uid: "user-1" } as User);

        await Promise.all(
            registrations.map(registration => store.timesheets.addDocument(registration))
        );

        const {
            getByText,
            container,
            unmount,
        } = render(<Timesheet />);

        await waitFor(() => expect(getByText("Foobar 5")));

        const headerAddButtonEls = container.querySelectorAll(".grouped-registration-header-add-button");
        expect(
            headerAddButtonEls.length
        ).toBe(3);

        act(() => {
            fireEvent.click(headerAddButtonEls[1]);
        });

        await waitFor(() => expect(goToNewRegistration).toBeCalled());

        unmount();
    });
});
