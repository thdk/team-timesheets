import { Octokit } from "@octokit/rest";
import { useQuery } from "react-query";
import { useRegistrationStore } from "../../../contexts/registration-context";
import { useUserStore } from "../../../contexts/user-context";
import { useViewStore } from "../../../contexts/view-context";

const SOURCE_ID = "github-commits";

export function useGithubCommits() {
    const userStore = useUserStore();
    const view = useViewStore();
    const timesheets = useRegistrationStore();

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

    const repoName = userStore.divisionUser?.githubRepos?.length
        ? userStore.divisionUser?.githubRepos[0]
        : undefined;

    const repoParts = repoName?.split("/");
    const owner = repoParts && repoParts.length ? repoParts[0] : undefined;
    const repo = repoParts && repoParts.length > 1 ? repoParts[1] : undefined;
    const author = userStore.divisionUser?.githubUsername;

    const queryResult = useQuery(
        [
            "commits",
            view.startOfDay?.toISOString(),
            view.endOfDay?.toISOString(),
            userStore.divisionUser?.githubUsername,
            owner,
            repo,
        ],
        async () => {
            if (!(view.startOfDay && repo && author)) {
                return Promise.reject();
            }

            const octokit = new Octokit(
                userStore.divisionUser?.githubToken
                    ? {
                        auth: userStore.divisionUser?.githubToken,
                    }
                    : undefined,
            );

            return octokit.repos.listCommits({
                sort: "author-date",
                owner: owner!,
                repo: repo!,
                since: view.startOfDay?.toISOString(),
                until: view.endOfDay?.toISOString(),
                author,
            });
        },
        {
            enabled: !!(view.startOfDay && repo && author),
        },
    );

    const filteredCommits = queryResult.isSuccess
        ? (queryResult.data?.data || []).filter((event) => excludedIds.indexOf(event.sha!) === -1)
        : [];

    return {
        ...queryResult,
        hasData: filteredCommits.length > 0,
        data: filteredCommits,
    }
}