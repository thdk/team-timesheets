import { Icon } from "@rmwc/icon";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";
import { IRegistration } from "../../../../common/lib";
import { DataRow, DataRowColumn, DataRowLine1, DataRowLine2 } from "../../../components/data-row";
import { useRegistrationStore } from "../../../contexts/registration-context";
import { useTasks } from "../../../contexts/task-context";
import { useViewStore } from "../../../contexts/view-context";
import { useGithubCommits } from "./use-github-commits";

export const GithubCommits = observer(({
    onClick,
}: {
    onClick: (registration: Partial<IRegistration>) => void;
}) => {
    const view = useViewStore();

    const timesheets = useRegistrationStore();

    const tasks = useTasks();

    const handleCommitClick = useCallback(
        (subject: string, id: string) => {
            onClick({
                date: new Date(view.moment.format()),
                description: subject,
                time: 1,
                task: tasks.tasks.find(t => t.name === "Programming")?.id,
                source: "github-commit",
                sourceId: id,
            });
        },
        [tasks, timesheets]
    );

    const commitsQuery = useGithubCommits();

    return (
        <>
            {commitsQuery.data.map((commit) => {
                const message = commit.commit.message.split("\n");
                const subject = message[0];
                const description = message.length > 1 ? message[1] : undefined;
                return (
                    <DataRow
                        key={commit.sha}
                        icon={<Icon title="Github" icon={"code"} />}
                        onClick={() => handleCommitClick(subject, commit.sha)}
                    >
                        <DataRowColumn
                            style={{
                                flexGrow: 1,
                            }}
                        >
                            <DataRowLine1>
                                Github: {subject}
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
});
