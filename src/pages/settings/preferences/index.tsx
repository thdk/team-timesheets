import * as React from 'react';
import { Chip, ChipSet } from '@material/react-chips';

import { Box } from '../../../components/layout/box';
import ClientSelect from '../../../containers/clients/select';
import { UserTasks } from '../../../containers/users/user-tasks';
import { FormField } from '../../../components/layout/form';

import { useStore } from '../../../contexts/store-context';
import { useUserStore } from '../../../stores/user-store';
import { useCallback } from 'react';
import { observer } from 'mobx-react-lite';


export const Preferences = observer(() => {
    const { config } = useStore();
    const userStore = useUserStore();

    const handleTaskSelect = useCallback((id: string, selected: boolean) => {
        const { tasks } = user;
        if (selected === !!tasks.get(id)) return;

        if (selected) tasks.set(id, true);
        else tasks.delete(id);

        userStore.updateAuthenticatedUser({
            tasks,
        });
    }, [userStore]);

    const defaultTaskChanged = useCallback((defaultTask: string) => {
        userStore.updateAuthenticatedUser({
            defaultTask
        });
    }, [userStore]);

    const defaultClientChanged = useCallback((defaultClient: string) => {
        userStore.updateAuthenticatedUser({
            defaultClient
        });
    }, [userStore]);

    if (!userStore.authenticatedUser) {
        return <></>;
    }
    const user = userStore.authenticatedUser;

    if (config.tasks.length === 0) return null;

    const { tasks: userTasks = new Map<string, true>(),
        defaultTask = undefined,
        defaultClient = undefined,
    } = user || {};

    const tasks = config.tasks
        .reduce((p, c) => {
            const { id: taskId,
                name: taskName,
                icon: taskIcon = undefined,
            } = c;

            const leadingIcon = taskIcon
                ? <i className="material-icons mdc-chip__icon mdc-chip__icon--leading">{taskIcon}</i>
                : undefined;

            p.push(
                <Chip leadingIcon={leadingIcon} handleSelect={handleTaskSelect} id={taskId} label={taskName!} key={taskId}></Chip>
            );
            return p;
        }, new Array());

    // TODO: create computed value on user store containing the data of the user tasks
    const userTasksChips = user.tasks.size > 1
        ? <UserTasks value={defaultTask} onChange={defaultTaskChanged}></UserTasks>
        : undefined;

    return (
        <>
            <Box>
                <h3 className="mdc-typography--subtitle1">
                    Pick your tasks
                </h3>
                <p>Only selected tasks will be available for you when adding a new regisration.</p>
                <ChipSet
                    selectedChipIds={Array.from(userTasks.keys())}
                    filter={true}
                >
                    {tasks}
                </ChipSet>

                {userTasksChips}

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
