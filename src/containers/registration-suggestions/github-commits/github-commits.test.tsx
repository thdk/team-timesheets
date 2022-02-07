import { Octokit } from "@octokit/rest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { IntlProvider } from "react-intl";
import { GithubCommits } from ".";
import { useUserStore } from "../../../contexts/user-context";
import { useGithubOauth } from "../../../oauth-providers";
import { UserStore } from "../../../stores/user-store";
import { createQueryClientWrapper } from "../../../__test-utils__/query-client-provider";

jest.mock("firebase/functions");
jest.mock("@octokit/rest");

jest.mock("../../../contexts/registration-context");
jest.mock("../../../contexts/task-context");
jest.mock("../../../contexts/view-context");
jest.mock("../../../contexts/user-context");
jest.mock("../../../oauth-providers");

afterEach(async () => {
    jest.clearAllMocks();
});

describe("GithubCommits", () => {
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
    });

    it("should not try to get commits when github is not configured", async () => {
        const useUserStore = jest.fn().mockReturnValue({
            divisionUser: {
                githubRepos: [],
            },
        });

        jest.mock("../../../contexts/user-context", () => ({
            useUserStore,
        }));

        const { unmount } = render(
            <IntlProvider
                locale={"en-US"}
                timeZone={"Europe/Brussels"}
            >
                <GithubCommits
                    onClick={jest.fn()}
                />
            </IntlProvider>
            ,
            {
                wrapper: createQueryClientWrapper()
            });

        expect(listCommits).not.toHaveBeenCalled();

        unmount();
    });

    it("should show github commits as suggestions", async () => {
        const onClick = jest.fn();
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

        (useUserStore as jest.Mock<ReturnType<typeof useUserStore>>).mockReturnValue({
            divisionUser: {
                githubRepos: [
                    "thdk/repo"
                ],
            }
        } as unknown as UserStore);

        (useGithubOauth as jest.Mock<ReturnType<typeof useGithubOauth>>).mockReturnValue({
            data: {
                login: "thdk",
            },
            oauth: {
                isLoading: false,
                accessToken: "foobar",
            }
        } as any);

        render(
            <IntlProvider
                locale={"en-US"}
                timeZone={"Europe/Brussels"}
            ><GithubCommits
                    onClick={onClick}
                />
            </IntlProvider>
            ,
            {
                wrapper: createQueryClientWrapper()
            });


        const eventItem1 = await screen.findByText(text => text === "Github: message 1");


        fireEvent.click(eventItem1);

        expect(onClick).toHaveBeenCalledWith({
            date: new Date("2020-03-21T23:00:00.000Z"),
            description: "message 1",
            sourceId: "sha1",
            source: "github-commit",
            task: undefined,
            time: 1,
        });

        const eventItem2 = await screen.findByText(text => text === "Github: message 2");
        fireEvent.click(eventItem2);

        expect(onClick).toHaveBeenCalledWith({
            date: new Date("2020-03-21T23:00:00.000Z"),
            description: "message 2",
            sourceId: "sha2",
            source: "github-commit",
            task: undefined,
            time: 1,
        });

    });
});
