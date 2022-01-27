import { Octokit } from "@octokit/rest";
import { ListDivider } from "@rmwc/list";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";
import { useQuery } from "react-query";
import { useRegistrationStore } from "../../contexts/registration-context";
import { useTasks } from "../../contexts/task-context";
import { useUserStore } from "../../contexts/user-context";
import { useViewStore } from "../../contexts/view-context";
import { useGapi } from "../../hooks/use-gapi";
import { goToNewRegistration } from "../../internal";
import { useRouterStore } from "../../stores/router-store";
import { useGoogleConfig } from "../configs/use-google-config";
import { GoogleCalendarEvents } from "./google-calendar";
import { GithubCommits } from "./github-commits";

export const RegistrationSuggestions = observer(({
    excludedIds = [],
}: {
    excludedIds?: string[];
}) => {

    const router = useRouterStore();

    const view = useViewStore();

    const config = useGoogleConfig();

    const tasks = useTasks();

    const timesheet = useRegistrationStore();

    const userStore = useUserStore();

    const handleEventClick = useCallback(
        (event: gapi.client.calendar.Event) => {
            const start = new Date((event.start?.date || event.start?.dateTime) as string);
            const end = event.start?.date ? undefined : new Date(event.end?.dateTime!);
            timesheet.createNewDocument({
                date: start,
                description: event.summary,
                time: end ? Math.abs(end.getTime() - start.getTime()) / 3600000 : undefined,
                task: tasks.tasks.find(t => t.name === "Meeting")?.id,
                source: "google-calendar",
                sourceId: event.id!,
            });
            goToNewRegistration(router);
        },
        [tasks, timesheet]
    );

    const handleCommitClick = useCallback(
        (subject: string, id: string) => {
            timesheet.createNewDocument({
                date: new Date(view.moment.format()),
                description: subject,
                time: 1,
                task: tasks.tasks.find(t => t.name === "Programming")?.id,
                source: "github-commit",
                sourceId: id,
            });
            goToNewRegistration(router);
        },
        [tasks, timesheet]
    );

    const {
        user,
        isGapiLoaded,
    } = useGapi(config);

    const eventsQuery = useQuery<Awaited<ReturnType<typeof gapi.client.calendar.events.list>>>(
        [
            "events",
            view.startOfDay?.toISOString(),
        ],
        () => {
            if (user && isGapiLoaded && !!view.startOfDay) {
                return gapi.client.calendar.events.list({
                    'calendarId': 'primary',
                    'timeMin': view.startOfDay?.toISOString(),
                    'timeMax': view.endOfDay?.toISOString(),
                    'showDeleted': false,
                    'maxResults': 10,
                    'singleEvents': true,
                    'orderBy': 'startTime',
                });
            }

            return {
                result: [],
                body: "",
            } as Awaited<ReturnType<typeof gapi.client.calendar.events.list>>;
        },
    )

    const repoName = userStore.divisionUser?.githubRepos
        ? userStore.divisionUser?.githubRepos[0]
        : undefined;


    const repoParts = repoName?.split("/");
    const owner = repoParts && repoParts.length ? repoParts[0] : undefined;
    const repo = repoParts && repoParts.length > 1 ? repoParts[1] : undefined;
    const author = userStore.divisionUser?.githubUsername;

    const commitsQuery = useQuery(
        [
            "commits",
            view.startOfDay?.toISOString(),
            userStore.divisionUser?.githubUsername,
            owner,
            repo,
        ],
        async () => {
            if (!(view.startOfDay && repo && author)) {
                return undefined;
            }

            const octokit = new Octokit(
                userStore.divisionUser?.githubToken
                    ? {
                        auth: userStore.divisionUser?.githubToken,
                    }
                    : undefined,
            );

            const request = {
                sort: "author-date",
                owner: owner!,
                repo: repo!,
                since: view.startOfDay?.toISOString(),
                until: view.endOfDay?.toISOString(),
                author,
            };

            return octokit.repos.listCommits(request);
        },
    );

    const filteredEvents = eventsQuery.isSuccess
        ? (eventsQuery.data.result.items || []).filter((event) => excludedIds.indexOf(event.id!) === -1)
        : [];

    const filteredCommits = commitsQuery.isSuccess
        ? (commitsQuery.data?.data || []).filter((event) => excludedIds.indexOf(event.sha!) === -1)
        : [];

    return (
        <div style={{
            paddingLeft: "1em",
            marginTop: "2em",
        }}>
            {
                (eventsQuery.isLoading || commitsQuery.isLoading)
                    ? (
                        <h3
                            className="mdc-typography--subtitle2"
                            style={{ fontWeight: 400 }}
                        >
                            Loading timesheet suggestions...
                        </h3>
                    )
                    : (filteredCommits.length || filteredEvents.length)
                        ? (
                            <>

                                <h3
                                    className="mdc-typography--subtitle2"
                                    style={{ fontWeight: 400 }}
                                >
                                    Suggestions for this timesheet:
                                </h3>
                                {
                                    !!filteredEvents.length &&
                                    <GoogleCalendarEvents
                                        events={filteredEvents}
                                        onClick={handleEventClick}
                                    />
                                }
                                {
                                    !!filteredCommits.length && <GithubCommits
                                        commits={filteredCommits}
                                        onClick={handleCommitClick}
                                    />
                                }
                                <ListDivider />
                            </>
                        )
                        : null
            }
        </div>
    );
});
