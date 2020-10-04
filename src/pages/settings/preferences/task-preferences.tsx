import React, { memo, useCallback } from "react";
import { TasksChips } from "../../../containers/tasks/chips";
import { useUserStore } from "../../../contexts/user-context";
import { useTasks } from "../../../contexts/task-context";

export const TaskPreferences = memo(() => {
    const userStore = useUserStore();
    const { tasks } = useTasks();
    const {
        tasks: userTasksIds = new Map<string, true>(),
        defaultTask = undefined,
    } = userStore.divisionUser || {};

    const handleTaskSelect = useCallback((id: string, selected: boolean) => {

        if (selected === !!userTasksIds.get(id)) return;

        if (selected) userTasksIds.set(id, true);
        else userTasksIds.delete(id);

        userStore.updateDivisionUser({
            tasks: userTasksIds,
        });
    }, [userTasksIds]);

    const defaultTaskChanged = useCallback((defaultTask: string) => {
        userStore.updateDivisionUser({
            defaultTask
        });
    }, [userStore]);

    return (
        <>
            <h3 className="mdc-typography--subtitle1">
                Pick your tasks
            </h3>
            <p>Only selected tasks will be available for you when adding a new regisration.</p>
            <TasksChips
                tasks={tasks}
                onTaskInteraction={(id, selected) => handleTaskSelect(id, !selected)}
                selectedTaskIds={Array.from(userTasksIds.keys())}
                filter
            />

            <h3 className="mdc-typography--subtitle1">Pick your default task</h3>
            <p>This task will be selected by default when you create a new registration.</p>
            <TasksChips
                tasks={tasks.filter((t => userTasksIds.get(t.id)))}
                onTaskInteraction={defaultTaskChanged}
                selectedTaskIds={defaultTask ? [defaultTask] : undefined}
                choice
            />
        </>
    );
});
