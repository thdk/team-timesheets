import * as React from 'react';
import { observer } from 'mobx-react';
import { Chip, ChipSet } from '@material/react-chips';

import store from '../../../../stores/RootStore';
import { UserTasks } from './UserTasks';
import { Box } from '../../../Layout/box';
import ClientSelect from '../../Timesheets/ClientSelect';

@observer
export class Preferences extends React.Component {
    render() {
        if (!store.user.authenticatedUser || store.config.tasks.docs.size === 0) return null;

        const { tasks: userTasks = new Map<string, true>(), defaultTask = undefined, defaultClient = undefined } = store.user.authenticatedUser || {};
        const tasks = Array.from(store.config.tasks.docs.values())
            .reduce((p, c) => {
                if (c.data) {
                    const { id: taskId, data: { name: taskName } } = c;
                    p.push(
                        <Chip handleSelect={this.taskClicked} id={taskId} label={taskName!} key={taskId}></Chip>
                    );
                }
                return p;
            }, new Array());

        // TODO: create computed value on user store containing the data of the user tasks
        const userTasksChips = store.user.authenticatedUser.tasks.size > 1
            ? <UserTasks value={defaultTask} onChange={this.defaultTaskChanged}></UserTasks>
            : undefined;

        return (
            <>
                <Box>
                    <h3 className="mdc-typography--subtitle1">Pick your tasks</h3>
                    <p>Only selected tasks will be available for you when adding a new regisration.</p>
                    <ChipSet selectedChipIds={Array.from(userTasks.keys())} filter={true}>{tasks}</ChipSet>

                    {userTasksChips}

                    <h3 className="mdc-typography--subtitle1">Pick default client</h3>
                    <ClientSelect onChange={this.defaultClientChanged} label="Default client" value={defaultClient}></ClientSelect>
                </Box>
            </>
        );
    }

    taskClicked = (id: string, selected: boolean) => {
        if (!store.user.authenticatedUser) return;

        const { tasks } = store.user.authenticatedUser;

        if (selected === !!tasks.get(id)) return;

        if (selected) tasks.set(id, true);
        else tasks.delete(id);

        store.user.updateAuthenticatedUser({
            tasks,
        });
    }

    defaultTaskChanged = (defaultTask: string) => {
        store.user.updateAuthenticatedUser({
            defaultTask
        });
    }

    defaultClientChanged = (defaultClient: string) => {
        store.user.updateAuthenticatedUser( {
            defaultClient
        });
    }
}