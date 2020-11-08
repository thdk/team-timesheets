import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react";
import { GoogleCalendarEvents } from "./";
import { initTestFirestore, deleteFirebaseAppsAsync } from "../../__tests__/utils/firebase";
import { Store } from "../../stores/root-store";
import { events } from "./events.test";
import { IntlProvider } from "react-intl";
import { goToNewRegistration } from "../../routes/registrations/detail";
import { useGapi } from "../../hooks/use-gapi";

jest.mock("../../hooks/use-gapi");
jest.mock("../configs/use-google-config", () => ({
    useGoogleConfig: jest.fn(),
}));

jest.mock("../../routes/registrations/detail");

const {
    firestore,
} = initTestFirestore("events");

const store = new Store({
    firestore,
});

jest.mock("../../contexts/store-context", () => ({
    useStore: () => store,
}));

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

    store.user.setUser({
        uid: "user-1",
        displayName: "user 1",
        email: "email@email.com",
    } as firebase.User);

    return store.config.tasksCollection.addAsync({
        name: "Meeting",
        icon: "people",
    });
});

afterAll(() => {
    store.dispose();
    return Promise.all([
        deleteFirebaseAppsAsync(),
    ])
});

describe("GoogleCalendarEventsContainer", () => {
    it("should render without google calendar events", async () => {
        getEventsList.mockResolvedValue({
            result: {
                items: [],
            },
        });
        const { asFragment } = render(<GoogleCalendarEvents />);

        await waitFor(() => expect(asFragment()).toMatchSnapshot());

    });

    it("should render when gapi is not loaded", async () => {
        (useGapi as jest.Mock<Partial<ReturnType<typeof useGapi>>>)
            .mockReturnValue({
                user: {} as gapi.auth2.GoogleUser,
                isGapiLoaded: false,
            });

        const { asFragment } = render(<GoogleCalendarEvents />);

        await waitFor(() => expect(asFragment()).toMatchSnapshot());

        (useGapi as jest.Mock<Partial<ReturnType<typeof useGapi>>>)
            .mockReturnValue({
                user: {} as gapi.auth2.GoogleUser,
                isGapiLoaded: true,
            });
    });

    it("should render when gapi is loaded but auth user is undefined", async () => {
        (useGapi as jest.Mock<Partial<ReturnType<typeof useGapi>>>)
            .mockReturnValue({
                isGapiLoaded: true,
            });

        const { asFragment } = render(<GoogleCalendarEvents />);

        await waitFor(() => expect(asFragment()).toMatchSnapshot());

        (useGapi as jest.Mock<Partial<ReturnType<typeof useGapi>>>)
            .mockReturnValue({
                user: {} as gapi.auth2.GoogleUser,
                isGapiLoaded: true,
            });
    });

    it("should render with google calendar events", async () => {
        getEventsList.mockResolvedValue({
            result: {
                items: events,
            },
        });

        const { asFragment } = render(
            <IntlProvider
                locale={"en-US"}
                timeZone={"Europe/Brussels"}
            ><GoogleCalendarEvents />
            </IntlProvider>
        );

        await waitFor(() => expect(asFragment()).toMatchSnapshot());

    });

    it("should set selected registration with data from event on event click", async () => {
        getEventsList.mockResolvedValue({
            result: {
                items: events,
            },
        });

        const { findByText } = render(
            <IntlProvider
                locale={"en-US"}
                timeZone={"Europe/Brussels"}
            ><GoogleCalendarEvents />
            </IntlProvider>
        );

        const eventItem1 = await findByText("Summary 1");
        fireEvent.click(eventItem1);

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
    });
});
