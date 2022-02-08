import { ListDivider } from "@rmwc/list";
import React from "react";
import { GoogleCalendarEvents } from "./google-calendar";
import { useRegistrationStore } from "../../contexts/registration-context";
import { IRegistration } from "../../../common";
import { useRouterStore } from "../../stores/router-store";
import { goToNewRegistration } from "../../internal";
import { useGoogleCalendarEvents } from "./google-calendar/use-google-calendar-events";
import { GithubCommits } from "./github-commits";
import { JiraIssues, useJiraIssues } from "./jira-issues";
import { useGithubCommits } from "./use-github-commits";

const RegistrationSuggestionsHeader = () => {
    return (
        <div style={{ paddingLeft: "1em" }}>
            <h3
                className="mdc-typography--subtitle1"
            >
                Suggestions for this timesheet
            </h3>
        </div>
    )
}

export const useSuggestionsQuery = () => {
    const { data: eventsData, ...eventsQuery } = useGoogleCalendarEvents();
    const { data: commitsData, ...commitsQuery } = useGithubCommits();
    const { data: issuesData, ...jiraQuery } = useJiraIssues();

    const queries = [
        eventsQuery,
        commitsQuery,
        jiraQuery
    ];

    return {
        isLoading: queries.some((q) => q.isLoading),
        hasData: queries.some((q) => q.hasData),
        eventsQuery,
        commitsQuery,
        jiraQuery,
    };
}

export const RegistrationSuggestions = () => {
    const timesheets = useRegistrationStore();
    const router = useRouterStore();

    const addRegistration = async (data: Partial<IRegistration>) => {
        await timesheets.createNewDocument(data);
        goToNewRegistration(router);
    };

    const {
        hasData,
    } = useSuggestionsQuery();

    return !hasData
        ? null
        : (
            <div style={{
                marginTop: "1em",
            }}>
                {
                    <>
                        <RegistrationSuggestionsHeader />
                        <GoogleCalendarEvents
                            onClick={addRegistration}
                        />
                        <JiraIssues
                            onClick={addRegistration}
                        />
                        <GithubCommits
                            onClick={addRegistration}
                        />
                        <ListDivider />
                    </>
                }
            </div>
        );
};
