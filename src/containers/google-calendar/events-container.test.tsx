import React from "react";

import path from "path";
import fs from "fs";
import { render, waitFor, fireEvent, act } from "@testing-library/react";
import { GoogleCalendarEvents } from "./";
import { Store } from "../../stores/root-store";
import { events } from "./events.test";
import { IntlProvider } from "react-intl";
import { goToNewRegistration } from "../../routes/registrations/detail";
import { useGapi } from "../../hooks/use-gapi";
import { initializeTestEnvironment, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { useStore } from "../../contexts/store-context";
import { User } from "firebase/auth";


jest.mock("../../contexts/store-context");
jest.mock("../../hooks/use-gapi");
jest.mock("../configs/use-google-config", () => ({
    useGoogleConfig: jest.fn(),
}));

jest.mock("../../routes/registrations/detail");

const getEventsList = jest.fn();

beforeAll(() => {
    (window["gapi"] as any) = {
        client: {
            calendar: {
                events: {
                    list: getEventsList
                }
            }
        }
    };
});

const projectId = "events-container";

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
            divisionId: "",
            recentProjects: [],
            tasks: new Map(),
            uid: "user-1",
        },
        "user-1",
    );

    store.auth.setUser({
        uid: "user-1",
        displayName: "user 1",
        email: "email@email.com",
    } as User);

    await store.tasks.addDocument({
        name: "Meeting",
        icon: "people",
    });
};

let testEnv: RulesTestEnvironment;
let firestore: any;

beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
        projectId,
        firestore: {
            rules: fs.readFileSync(path.resolve(__dirname, "../../../firestore.rules.test"), "utf8"),
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

describe("GoogleCalendarEventsContainer", () => {
    it("should render without google calendar events", async () => {
        getEventsList.mockResolvedValue({
            result: {
                items: [],
            },
        });
        const { asFragment, unmount } = render(
            <GoogleCalendarEvents />
        );

        await waitFor(() => expect(asFragment()).toMatchSnapshot());

        unmount();
    });

    it("should render when gapi is not loaded", async () => {
        (useGapi as jest.Mock<Partial<ReturnType<typeof useGapi>>>)
            .mockReturnValue({
                user: {} as gapi.auth2.GoogleUser,
                isGapiLoaded: false,
            });

        const { asFragment, unmount } = render(
            <GoogleCalendarEvents />
        );

        await waitFor(() => expect(asFragment()).toMatchSnapshot());

        (useGapi as jest.Mock<Partial<ReturnType<typeof useGapi>>>)
            .mockReturnValue({
                user: {} as gapi.auth2.GoogleUser,
                isGapiLoaded: true,
            });

        unmount();
    });

    it("should render when gapi is loaded but auth user is undefined", async () => {
        (useGapi as jest.Mock<Partial<ReturnType<typeof useGapi>>>)
            .mockReturnValue({
                isGapiLoaded: true,
            });

        const { asFragment, unmount } = render(
            <GoogleCalendarEvents />
        );

        await waitFor(() => expect(asFragment()).toMatchSnapshot());

        (useGapi as jest.Mock<Partial<ReturnType<typeof useGapi>>>)
            .mockReturnValue({
                user: {} as gapi.auth2.GoogleUser,
                isGapiLoaded: true,
            });

        unmount();
    });

    it("should render with google calendar events", async () => {
        getEventsList.mockResolvedValue({
            result: {
                items: events,
            },
        });

        const { asFragment, unmount } = render(
            <IntlProvider
                locale={"en-US"}
                timeZone={"Europe/Brussels"}
            ><GoogleCalendarEvents />
            </IntlProvider>
        );

        await waitFor(() => expect(asFragment()).toMatchSnapshot());

        unmount();

    });

    it("should set selected registration with data from event on event click", async () => {
        getEventsList.mockResolvedValue({
            result: {
                items: events,
            },
        });

        const { findByText, unmount } = render(
            <IntlProvider
                locale={"en-US"}
                timeZone={"Europe/Brussels"}
            ><GoogleCalendarEvents />
            </IntlProvider>
        );

        const eventItem1 = await findByText("Summary 1");

        act(() => {
            fireEvent.click(eventItem1);
        });

        await waitFor(
            () => expect(
                store.timesheets.activeDocument?.sourceId).toBe("event-1")
        );

        expect(goToNewRegistration).toBeCalledTimes(1);

        const eventItem2 = await findByText("Summary 2");
        fireEvent.click(eventItem2);

        await waitFor(
            () => expect(
                store.timesheets.activeDocument
            ).toEqual(
                expect.objectContaining({
                    sourceId: "event-2",
                    time: 2,
                    description: "Summary 2",
                })
            )
        );

        expect(goToNewRegistration).toBeCalledTimes(2);

        unmount();
    });
});
