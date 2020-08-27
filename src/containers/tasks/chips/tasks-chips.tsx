import React from "react";
import { Chip, ChipSet, ChipSetProps } from "@rmwc/chip";
import { Icon } from "@rmwc/icon";

import { ITask } from "../../../../common";

export const TasksChips = ({
    onTaskInteraction,
    selectedTaskIds,
    tasks,
    filter,
    choice,
    ...chipSetProps
}: {
    onTaskInteraction: (id: string, selected?: boolean) => void;
    selectedTaskIds?: string[];
    tasks: (ITask & { id: string })[];
} & ChipSetProps) => {
    const chips = (
        <>
            {
                tasks.map((t) => {
                    const { id: taskId, name: taskName, icon: taskIcon = undefined } = t;
                    const leadingIcon = taskIcon
                        ? <Icon icon={taskIcon} />
                        : undefined;

                        const selected = selectedTaskIds?.indexOf(taskId) !== -1;

                    return (
                        <Chip
                            checkmark={filter}
                            icon={leadingIcon}
                            selected={selected}
                            onInteraction={() => onTaskInteraction(taskId, selected!)}
                            id={taskId}
                            label={taskName!}
                            key={taskId}
                        />
                    );
                })
            }
        </>
    );

    return (
        <ChipSet
            filter={filter}
            choice={choice}
            {...chipSetProps}
        >
            {chips}
        </ChipSet>
    );
};