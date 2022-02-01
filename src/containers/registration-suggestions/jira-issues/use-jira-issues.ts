import { useQueries } from "react-query";
import { encode } from "js-base64";
import Mustache from "mustache";

import { useRegistrationStore } from "../../../contexts/registration-context";
import { useUserStore } from "../../../contexts/user-context";
import { useViewStore } from "../../../contexts/view-context";
import { useConfigs } from "../../configs/use-configs";
import { useJiraQueries } from "./use-jira-queries";

export type JiraIssue = {
    "expand": string;
    "id": string;
    "self": string;
    "key": string;
    "fields": {
        summary?: string,
    }
}

type JiraSearchResult = {
    "expand": string;
    "startAt": number;
    "maxResults": number;
    "total": number;
    "issues": JiraIssue[];
}

const SOURCE_ID = "jira-issues";

export function useJiraIssues() {
    const userStore = useUserStore();
    const view = useViewStore();
    const timesheets = useRegistrationStore();
    const values = useJiraQueries();
    
    const jiraQueries = (values || []).map<{
        jql: string;
        taskId: string;
        id: string;
    }>((doc) => {
        const {
            taskId,
            jql,
        } = doc;
        
        return {
            id: doc.id,
            jql,
            taskId,
        }
    });
    
    const excludedIds = timesheets.dayRegistrations.registrations
        .reduce<string[]>(
            (p, c) => {
                if (c.data?.sourceId && SOURCE_ID) {
                    p.push(c.data.sourceId)
                }
                return p;
            },
            [],
        );

    const {
        getConfigValue,
    } = useConfigs();

    const host = getConfigValue("jira-host-url", false);

    const username = userStore.divisionUser?.jiraUsername;
    const password = userStore.divisionUser?.jiraPassword;

    const queryResult = useQueries(
        jiraQueries.map((q) => ({
            queryKey: [
                "jira-issues",
                view.startOfDay?.toISOString(),
                view.endOfDay?.toISOString(),
                username,
                password,
                host,
                q.id
            ],
            queryFn: async () => {
                const jql =  Mustache.render(q.jql, {
                    username,
                    date: view.startOfDay!.toISOString().split('T')[0]
                });

                return fetch(`${host}/rest/api/2/search?`, {
                    method: "POST",
                    headers: {
                        Authorization: `Basic ${encode(`${username}:${password}`)}`,
                        'Content-Type': 'application/json',
                    },
                    mode: "cors",
                    credentials: "include",
                    body: JSON.stringify({
                        jql,
                    })
                }).then((response) => response.json());
            },
            enabled: !!(view.startOfDay && host && username && password),
            select: (data: JiraSearchResult) => ({
                ...q,
                issues: data.issues,
            }),
        }))
    );

    const filteredIssues = queryResult.some((query) => query.isLoading)
        ? []
        : queryResult.reduce<{
            issues: JiraIssue[];
            taskId?: string;
            id: string;
        }[]>(
            (p, c) => {
                if (!c.data) {
                    return p;
                }

                const {
                    issues,
                    ...meta
                } = c.data;


                const newIssues = issues.filter((issue) => excludedIds.indexOf(`${meta.id}-${issue.id}`) === -1);

                if (newIssues.length) {
                    p.push({
                        ...meta,
                        issues: newIssues,
                    });
                }
                return p;
            },
            [],
        );
    return {
        isLoading: queryResult.some((q) => q.isLoading),
        hasData: filteredIssues.filter((q) => q.issues.length > 0),
        data: filteredIssues,
    };
}
