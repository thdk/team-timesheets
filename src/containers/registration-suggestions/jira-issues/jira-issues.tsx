import { Icon } from "@rmwc/icon";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";
import { IRegistration } from "../../../../common";
import { DataRow, DataRowColumn, DataRowLine1, DataRowLine2 } from "../../../components/data-row";
import { useRegistrationStore } from "../../../contexts/registration-context";
import { useTasks } from "../../../contexts/task-context";
import { useViewStore } from "../../../contexts/view-context";
import { useConfigs } from "../../configs/use-configs";
import { useJiraIssues } from "./use-jira-issues";

export const JiraIssues = observer(({
    onClick,
}: {
    onClick: (registration: Partial<IRegistration>) => void;
}) => {
    const view = useViewStore();

    const timesheets = useRegistrationStore();

    const tasks = useTasks();
    const { getConfigValue } = useConfigs();

    const handleIssueClick = useCallback(
        (subject: string, id: string, { taskId }: { taskId?: string }) => {
            view.startOfDay && onClick({
                date: view.startOfDay,
                description: subject,
                time: 1,
                task: taskId === undefined ? tasks.tasks.find(t => t.name === "Programming")?.id : taskId,
                source: "jira-query",
                sourceId: id,
            });
        },
        [tasks, timesheets],
    );

    const host = getConfigValue("jira-host-url", false);
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
                                    {subject}
                                </DataRowLine1>
                                <DataRowLine2>
                                    <a
                                        href={`${host}/browse/${issue.key}`}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {issue.key}
                                    </a>
                                </DataRowLine2>
                            </DataRowColumn>
                        </DataRow>
                    );
                })
            })}
        </>
    );
});
