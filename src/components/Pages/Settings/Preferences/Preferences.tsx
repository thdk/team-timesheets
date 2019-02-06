import * as React from 'react';
import { observer } from 'mobx-react';
import store from '../../../../stores/RootStore';
import { Chip, ChipSet } from '../../../../MaterialUI/chips';
import { UserTasks } from './UserTasks';
import { Box } from '../../../Layout/box';
import ClientSelect from '../../Timesheets/ClientSelect';

@observer
export class Preferences extends React.Component {
    render() {
        if (!store.user.currentUser || store.config.tasks.docs.size === 0) return null;

        const { tasks: userTasks = new Map(), defaultTask = undefined, defaultClient = undefined } = store.user.currentUser || {};
        const tasks = Array.from(store.config.tasks.docs.values())
            .reduce((p, c) => {
                if (c.data) {
                    const { id: taskId, data: { name: taskName } } = c;

                    const isSelected = userTasks && userTasks.get(taskId) === true;
                    p.push(
                        <Chip type="filter" onClick={this.taskClicked} id={taskId} text={taskName!} key={taskId} isSelected={isSelected}></Chip>
                    );
                }
                return p;
            }, new Array());

        // TODO: create computed value on user store containing the data of the user tasks
        const userTasksChips = store.user.currentUser.tasks.size > 1
            ? <UserTasks value={defaultTask} onChange={this.defaultTaskChanged}></UserTasks>
            : undefined;

        return (
            <>
                <Box>
                    <h3 className="mdc-typography--subtitle1">Pick your tasks</h3>
                    <p>Only selected tasks will be available for you when adding a new regisration.</p>
                    <ChipSet chips={tasks} type="filter"></ChipSet>

                    {userTasksChips}

                    <h3 className="mdc-typography--subtitle1">Pick default client</h3>
                    <ClientSelect onChange={this.defaultClientChanged} label="Default client" value={defaultClient}></ClientSelect>
                </Box>
            </>
        );
    }

    taskClicked = (id: string, selected: boolean) => {
        if (!store.user.currentUser) return;

        const { tasks } = store.user.currentUser;

        if (selected) tasks.set(id, true);
        else tasks.delete(id);

        store.user.updateUser({
            tasks,
        });
    }

    defaultTaskChanged = (defaultTask: string) => {
        store.user.updateUser({
            defaultTask
        });
    }

    defaultClientChanged = (defaultClient: string) => {
        store.user.updateUser( {
            defaultClient
        });
    }
}