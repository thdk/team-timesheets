import * as React from 'react';
import { observer } from 'mobx-react';
import store from '../../stores/RootStore';
import { Chip, ChipSet } from '../../MaterialUI/chips';
import { Box } from '../Layout/box';
import { UserTasks } from './Settings/Preferences/UserTasks';

@observer
export class Preferences extends React.Component {
    render() {
        if (!store.user.user) return null;

        const { tasks: userTasks = new Map(), defaultTask = undefined } = store.user.user.data || {};
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
        const userTasksChips = store.user.user.data!.tasks.size > 1
            ? <UserTasks value={defaultTask} onChange={this.defaultTaskChanged}></UserTasks>
            : undefined;

        return (
            <Box>
                <h3 className="mdc-typography--subtitle1">Pick your tasks</h3>
                <p>Only selected tasks will be available for you when adding a new regisration.</p>
                <ChipSet chips={tasks} type="filter"></ChipSet>

                {userTasksChips}
            </Box>
        );
    }

    taskClicked = (id: string, selected: boolean) => {
        if (!store.user.user || !store.user.user.data) return;

        const { tasks } = store.user.user.data;

        if (selected) tasks.set(id, true);
        else tasks.delete(id);

        store.user.users.updateAsync(store.user.userId!, {
            tasks,
        });
    }

    defaultTaskChanged = (defaultTask: string) => {
        if (!store.user.user || !store.user.user.data) return;

        store.user.users.updateAsync(store.user.userId!, {
            defaultTask
        });
    }
}