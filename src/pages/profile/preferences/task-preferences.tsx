import React, { useCallback } from "react";
import { TasksChips } from "../../../containers/tasks/chips";
import { useUserStore } from "../../../contexts/user-context";
import { useTasks } from "../../../contexts/task-context";

const UserDefaultTask = () => {
    const userStore = useUserStore();
    const { tasks } = useTasks();
    const {
        tasks: userTasksIds = new Map<string, true>(),
        defaultTask = undefined,
    } = userStore.divisionUser || {};

    const defaultTaskChanged = useCallback((defaultTask: string) => {
        userStore.updateDivisionUser({
            defaultTask
        });
    }, [userStore.divisionUser]);

    return userTasksIds.size > 1
        ? (
            <>
                <h3 className="mdc-typography--subtitle1">Pick your default task</h3>
                <p>This task will be selected by default when you create a new registration.</p>
                <TasksChips
                    tasks={tasks.filter((t => userTasksIds.get(t.id)))}
                    onTaskInteraction={defaultTaskChanged}
                    selectedTaskIds={defaultTask ? [defaultTask] : undefined}
                    choice
                />
            </>
        )
        : null;
};

export const TaskPreferences = () => {
    const userStore = useUserStore();
    const { tasks } = useTasks();
    const divisionUser = userStore.divisionUser;
    const userTasksIds = divisionUser?.tasks || new Map<string, true>();

    const handleTaskSelect = useCallback((id: string, unSelected?: boolean) => {
        const selected = !unSelected;
        if (selected === !!userTasksIds.get(id)) return;
        if (selected) userTasksIds.set(id, true);
        else userTasksIds.delete(id);
        userStore.updateDivisionUser({
            tasks: userTasksIds,
        });
    }, [userTasksIds]);

    return (
        <>
            <h3 className="mdc-typography--subtitle1">
                Pick your tasks
            </h3>
            <p>Only selected tasks will be available for you when adding a new regisration.</p>
            <TasksChips
                tasks={tasks}
                onTaskInteraction={handleTaskSelect}
                selectedTaskIds={Array.from(userTasksIds.keys())}
                filter
            />
            <UserDefaultTask />
        </>
    );
};
