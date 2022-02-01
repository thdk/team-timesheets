import { render, screen } from "@testing-library/react";
import { Doc } from "firestorable";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { JiraIssue, JiraIssues } from ".";
import { IRegistrationData } from "../../../../common";
import { IRegistration } from "../../../../common";
import { useRegistrationStore } from "../../../contexts/registration-context";
import { useTasks } from "../../../contexts/task-context";
import { useUserStore } from "../../../contexts/user-context";
import { useJiraQueries } from "./use-jira-queries";

jest.mock("../../../contexts/registration-context");
jest.mock("../../../contexts/task-context");
jest.mock("../../../contexts/view-context");
jest.mock("../../../contexts/user-context");
jest.mock("../../configs/use-configs");
jest.mock("./use-jira-queries");

describe("JiraIssues", () => {
    const client = new QueryClient();

    const useJiraQueriesMock = jest.fn();
    const mockFetch = jest.fn();

    beforeAll(() => {
        (useJiraQueries as jest.Mock<ReturnType<typeof useJiraQueries>>)
            .mockImplementation(useJiraQueriesMock);

        jest.spyOn(global, 'fetch' as any).mockImplementation(mockFetch);
    });

    const onClick = jest.fn();

    it("renders when nothing has been configured", () => {
        render(
            <QueryClientProvider client={client}>
                <JiraIssues onClick={onClick} />
            </QueryClientProvider>,
        );
    });

    describe("when everything is configured and their are issues", () => {
        beforeEach(() => {
            useJiraQueriesMock.mockReturnValue([
                {
                    id: "1",
                    jql: "foo = bar",
                    taskId: "task-1",
                },
                {
                    id: "2",
                    jql: "foo = foobar",
                },
            ]);

            (useUserStore as jest.Mock<ReturnType<typeof useUserStore>>)
                .mockReturnValue({
                    divisionUser: {
                        jiraPassword: "foo",
                        jiraUsername: "bar",
                    },
                } as any);

            (useTasks as jest.Mock<ReturnType<typeof useTasks>>)
                .mockReturnValue({
                    tasks: [{
                        id: "task-1",
                        icon: "task-icon"
                    }],
                } as any);

            mockFetch.mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue({
                    issues: [
                        {
                            id: "1",
                            key: "PRJ-1",
                            fields: {
                                summary: "My first issue",
                            },
                        },
                    ] as JiraIssue[],
                }),
            });

            mockFetch.mockResolvedValueOnce({
                json: jest.fn().mockResolvedValue({
                    issues: [
                        {
                            id: "2",
                            key: "PRJ-1",
                            fields: {
                                summary: "My other issue",
                            },
                        },
                    ] as JiraIssue[],
                }),
            });
        });

        it("renders jira issues that match the jira-queries", async () => {
            render(
                <QueryClientProvider client={client}>
                    <JiraIssues onClick={onClick} />
                </QueryClientProvider>,
            );

            await screen.findByText(content => content === "Jira: My first issue");
        });

        it("calls onClick prop with data for a new registrations when clicked", async () => {
            render(
                <QueryClientProvider client={client}>
                    <JiraIssues onClick={onClick} />
                </QueryClientProvider>,
            );

            let issueEl = await screen.findByText(content => content === "Jira: My first issue");

            issueEl.click();

            expect(onClick).toHaveBeenCalledWith({
                date: new Date("2020-03-22T00:00:00.000Z"),
                description: "My first issue",
                source: "jira-query",
                sourceId: "1-1",
                task: "task-1",
                time: 1,
            });

            issueEl = await screen.findByText(content => content === "Jira: My other issue");

            issueEl.click();

            expect(onClick).toHaveBeenCalledWith({
                date: new Date("2020-03-22T00:00:00.000Z"),
                description: "My other issue",
                source: "jira-query",
                sourceId: "2-2",
                task: undefined,
                time: 1,
            });
        });

        it("does not show suggestions that already have been added to the timesheet", async () => {
            (useRegistrationStore as jest.Mock<ReturnType<typeof useRegistrationStore>>)
                .mockReturnValue({
                    dayRegistrations: {
                        groupKey: "group-1",
                        totalTime: 1,
                        isCollapsed: false,
                        registrations: [
                            {
                                data: {
                                    sourceId: "2-2",
                                    description: "My other issue",
                                    source: "jira-query",
                                    date: new Date("2020-03-22T00:00:00.000Z"),
                                    isPersisted: true,
                                    userId: "user-1",
                                }
                            },
                            {
                                data: {
                                    sourceId: "2-2",
                                    description: "My other issue",
                                    source: "another-source",
                                    date: new Date("2020-03-22T00:00:00.000Z"),
                                    isPersisted: true,
                                    userId: "user-1",
                                }
                            },
                            {
                                data: undefined,
                            }
                        ] as Doc<IRegistration, IRegistrationData>[]
                    }
                } as any);

                render(
                    <QueryClientProvider client={client}>
                        <JiraIssues onClick={onClick} />
                    </QueryClientProvider>,
                );
    
                await screen.findByText(content => content === "Jira: My first issue");

                expect(screen.queryByText(content => content === "Jira: My other issue")).toBeFalsy();
        });

        it("still shows results when one of the queries has failed", async () => {
            mockFetch.mockRejectedValueOnce(undefined);

            render(
                <QueryClientProvider client={client}>
                    <JiraIssues onClick={onClick} />
                </QueryClientProvider>,
            );

            await screen.findByText(content => content === "Jira: My first issue");

            expect(screen.queryByText(content => content === "Jira: My other issue")).toBeFalsy();
        })
    });
});
