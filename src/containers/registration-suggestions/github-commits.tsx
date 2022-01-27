import { RestEndpointMethodTypes } from "@octokit/rest";
import { Icon } from "@rmwc/icon";
import React from "react";
import { DataRow, DataRowColumn, DataRowLine1, DataRowLine2 } from "../../components/data-row";

export function GithubCommits({
    commits,
    onClick,
}: {
    commits: RestEndpointMethodTypes["repos"]["listCommits"]["response"]["data"];
    onClick: (description: string, sha: string) => void;
}) {
    return (
        <>
            {commits.map((commit) => {
                const message = commit.commit.message.split("\n");
                const subject = message[0];
                const description = message.length > 1 ? message[1] : undefined;
                return (
                    <DataRow
                        key={commit.sha}
                        icon={<Icon title="Github" icon={"code"} />}
                        onClick={() => onClick(subject, commit.sha)}
                    >
                        <DataRowColumn
                            style={{
                                flexGrow: 1,
                            }}
                        >
                            <DataRowLine1>
                                {subject}
                            </DataRowLine1>
                            <DataRowLine2>
                                {description}
                            </DataRowLine2>
                        </DataRowColumn>
                    </DataRow>
                );
            })}
        </>
    );
}
