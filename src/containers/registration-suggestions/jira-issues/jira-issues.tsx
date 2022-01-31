import { Icon } from "@rmwc/icon";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";
import { IRegistration } from "../../../../common/lib";
import { DataRow, DataRowColumn, DataRowLine1 } from "../../../components/data-row";
import { useRegistrationStore } from "../../../contexts/registration-context";
import { useTasks } from "../../../contexts/task-context";
import { useViewStore } from "../../../contexts/view-context";
import { useJiraIssues } from "./use-jira-issues";

export const JiraIssues = observer(({
    onClick,
}: {
    onClick: (registration: Partial<IRegistration>) => void;
}) => {
    const view = useViewStore();

    const timesheets = useRegistrationStore();

    const tasks = useTasks();

    const handleIssueClick = useCallback(
        (subject: string, id: string, { taskId }: { taskId?: string }) => {
            onClick({
                date: new Date(view.moment.format()),
                description: subject,
                time: 1,
                task: taskId === undefined ? tasks.tasks.find(t => t.name === "Programming")?.id : taskId,
                source: "jira-query",
                sourceId: id,
            });
        },
        [tasks, timesheets]
    );

    const issuesQuery = useJiraIssues();

    return (
        <>
            {issuesQuery.data.flatMap(({ issues, taskId, id }) => {
                const task = tasks.tasks.find((task) => task.id === taskId);

                return issues.map((issue) => {
                    const subject = issue.fields.summary || "";
                    return (
                        <DataRow
                            key={`${id}-${issue.id}`}
                            icon={<Icon title={task?.name} icon={task?.icon} />}
                            onClick={() => handleIssueClick(subject, `${id}-${issue.id}`, { taskId })}
                        >
                            <DataRowColumn
                                style={{
                                    flexGrow: 1,
                                }}
                            >
                                <DataRowLine1>
                                    Jira: {subject}
                                </DataRowLine1>
                            </DataRowColumn>
                        </DataRow>
                    );
                })
            })}
        </>
    );
});
