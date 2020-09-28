import * as React from 'react';

import { Box } from '../../../components/layout/box';
import ClientSelect from '../../../containers/clients/select';
import { FormField } from '../../../components/layout/form';

import { useStore } from '../../../contexts/store-context';
import { useUserStore } from "../../../contexts/user-context";
import { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useTasks } from '../../../contexts/task-context';
import { TasksChips } from '../../../containers/tasks/chips';


export const Preferences = observer(() => {
    const { config } = useStore();
    const { tasks } = useTasks();
    const userStore = useUserStore();

    const {
        tasks: userTasksIds = new Map<string, true>(),
        defaultTask = undefined,
        defaultClient = undefined,
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

    const defaultClientChanged = useCallback((defaultClient: string) => {
        userStore.updateDivisionUser({
            defaultClient
        });
    }, [userStore]);

    if (!userStore.divisionUser) {
        return <></>;
    }

    if (config.tasks.length === 0) return null;

    return (
        <>
            <Box>
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

                <h3 className="mdc-typography--subtitle1">
                    Pick default client
                </h3>
                <FormField first={false}>
                    <ClientSelect
                        onChange={defaultClientChanged}
                        label="Default client"
                        value={defaultClient}
                    />
                </FormField>
            </Box>
        </>
    );
});
