import React from "react";

import path from "path";
import fs from "fs";
import { render, waitFor, fireEvent, act, screen } from "@testing-library/react";
import { Store } from "../../stores/root-store";
import { IntlProvider } from "react-intl";
import { goToNewRegistration } from "../../routes/registrations/detail";
import { useGapi } from "../../hooks/use-gapi";
import { initializeTestEnvironment, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { useStore } from "../../contexts/store-context";
import { User } from "firebase/auth";
import { events } from "./google-calendar/events.test";
import { RegistrationSuggestions } from ".";
import { createQueryClientWrapper } from "../../__test-utils__/query-client-provider";
import { Octokit } from "@octokit/rest";
import { useUserStore } from "../../contexts/user-context/__mocks__";

jest.mock("../../contexts/store-context");
jest.mock("../../hooks/use-gapi");
jest.mock("../../contexts/view-context");
jest.mock("../configs/use-google-config", () => ({
    useGoogleConfig: jest.fn(),
}));

jest.mock("@octokit/rest");

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
            githubRepos: [
                "foo/bar",
            ],
            githubToken: "123",
            githubUsername: "thdk"
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
    jest.restoreAllMocks();
    jest.clearAllMocks();
});

afterAll(() => testEnv.cleanup());

describe("GoogleCalendarEventsContainer", () => {
    const listCommits = jest.fn().mockResolvedValue({
        success: true,
        isLoading: false,
        data: [],
    });

    beforeEach(() => {
        (Octokit as any).mockImplementation(() => {
            return ({
                repos: {
                    listCommits,
                }
            })
        });

        (useGapi as jest.Mock<Partial<ReturnType<typeof useGapi>>>)
            .mockReturnValue({
                user: {} as gapi.auth2.GoogleUser,
                isGapiLoaded: true,
            });
    })

    it("should render without google calendar events", async () => {
        getEventsList.mockResolvedValue({
            result: {
                items: [],
            },
        });
        const { asFragment, unmount } = render(
            <RegistrationSuggestions />,
            {
                wrapper: createQueryClientWrapper()
            }
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
            <RegistrationSuggestions />,
            {
                wrapper: createQueryClientWrapper()
            }
        );

        await waitFor(() => expect(asFragment()).toMatchSnapshot());

        unmount();
    });

    it("should render when gapi is loaded but auth user is undefined", async () => {
        (useGapi as jest.Mock<Partial<ReturnType<typeof useGapi>>>)
            .mockReturnValue({
                isGapiLoaded: true,
            });

        const { asFragment, unmount } = render(
            <RegistrationSuggestions />,
            {
                wrapper: createQueryClientWrapper()
            }
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

        const { unmount } = render(
            <IntlProvider
                locale={"en-US"}
                timeZone={"Europe/Brussels"}
            ><RegistrationSuggestions />
            </IntlProvider>
            ,
            {
                wrapper: createQueryClientWrapper()
            });

        await screen.findByText("All day event 1");

        unmount();
    });

    it("should not try to get commits when github is not configured", async () => {
        const useUserStore = jest.fn().mockReturnValue({
            divisionUser: {
                githubRepos: [],
                githubUsername: undefined,
            },
        });
        jest.doMock("../../contexts/user-context", () => ({
            useUserStore,
        }));

        const { unmount } = render(
            <IntlProvider
                locale={"en-US"}
                timeZone={"Europe/Brussels"}
            ><RegistrationSuggestions />
            </IntlProvider>
            ,
            {
                wrapper: createQueryClientWrapper()
            });

        await screen.findByText("All day event 1");

        expect(listCommits).not.toHaveBeenCalled();

        unmount();
    });

    it("should show github commits as suggestions", async () => {
        listCommits.mockResolvedValue(() => {
            return {
                success: true,
                isLoading: false,
                data: [
                    {
                        sha: "sha1",
                        commit: {
                            message: "message 1"
                        }
                    },
                    {
                        sha: "sha2",
                        commit: {
                            message: "message 2\nfixes #1234"
                        }
                    },
                ],
            }
        })
        render(
            <IntlProvider
                locale={"en-US"}
                timeZone={"Europe/Brussels"}
            ><RegistrationSuggestions />
            </IntlProvider>
            ,
            {
                wrapper: createQueryClientWrapper()
            });

        await waitFor(() => {
            expect(true).toBe(true);
        });

    });

    it("should set selected registration with data from selected github commit", async () => {
        listCommits.mockResolvedValue(() => {
            return {
                success: true,
                isLoading: false,
                data: [
                    {
                        sha: "sha1",
                        commit: {
                            message: "message 1"
                        }
                    },
                    {
                        sha: "sha2",
                        commit: {
                            message: "message 2\nfixes #1234"
                        }
                    },
                ],
            }
        });

        render(
            <IntlProvider
                locale={"en-US"}
                timeZone={"Europe/Brussels"}
            >
                <RegistrationSuggestions />
            </IntlProvider>,
            {
                wrapper: createQueryClientWrapper()
            }
        );

        const commit1 = await screen.findByText("message 1");

        act(() => {
            fireEvent.click(commit1);
        });

        await waitFor(
            () => expect(
                store.timesheets.activeDocument?.sourceId).toBe("sha1")
        );

        expect(goToNewRegistration).toBeCalledTimes(1);

        const commit2 = await screen.findByText("message 2");
        fireEvent.click(commit2);

        await waitFor(
            () => expect(
                store.timesheets.activeDocument
            ).toEqual(
                expect.objectContaining({
                    sourceId: "sha2",
                    time: 1,
                    description: "message 2",
                })
            )
        );

        expect(goToNewRegistration).toBeCalledTimes(2);

    });

    it("should set selected registration with data from event on event click", async () => {
        getEventsList.mockResolvedValue({
            result: {
                items: events,
            },
        });

        render(
            <IntlProvider
                locale={"en-US"}
                timeZone={"Europe/Brussels"}
            ><RegistrationSuggestions />
            </IntlProvider>,
            {
                wrapper: createQueryClientWrapper()
            }
        );

        const eventItem1 = await screen.findByText("Summary 1");

        act(() => {
            fireEvent.click(eventItem1);
        });

        await waitFor(
            () => expect(
                store.timesheets.activeDocument?.sourceId).toBe("event-1")
        );

        expect(goToNewRegistration).toBeCalledTimes(1);

        const eventItem2 = await screen.findByText("Summary 2");
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
