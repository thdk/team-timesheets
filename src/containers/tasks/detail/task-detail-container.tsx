import React, { useCallback } from "react";

import { TaskDetail } from "./task-detail";
import { observer } from "mobx-react-lite";
import { useTasks } from "../../../contexts/task-context";

export const TaskDetailContainer = observer(() => {
    const tasks = useTasks();

    const task = tasks.activeDocument;

    const handleIconChanged = useCallback((icon: string) => {
        if (task)
            task.icon = icon;
    }, [task]);

    const handleNameChanged = useCallback((name: string) => {
        if (task)
            task.name = name;
    }, [task]);

    return <TaskDetail
        onIconChanged={handleIconChanged}
        onNameChanged={handleNameChanged}
        {...task}
    />;
});