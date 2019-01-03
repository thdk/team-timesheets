import * as React from 'react';
import { observer } from 'mobx-react';
import store from '../../stores/RootStore';
import { Chip, ChipSet } from '../../MaterialUI/chips';
import { Box } from '../Layout/box';

@observer
export class Preferences extends React.Component {
    render() {
        const { tasks: userTasks = new Map(), defaultTask = undefined } = store.user.user ? store.user.user.data || {} : {};
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
        const userTasksChips = Array.from(userTasks.keys()).map(t => {
            const taskData = store.config.tasks.docs.get(t);
            const { id: taskId = "", data: { name: taskName = "ARCHIVED"} = {} } = taskData || {};
            const isSelected = defaultTask === taskId;
           return <Chip type="choice" onClick={this.defaultTaskChanged} id={taskId} text={taskName!} key={taskId} isSelected={isSelected}></Chip>
        })
        return (
            <Box>
                <h3 className="mdc-typography--subtitle1">Pick your tasks</h3>
                <p>Only selected tasks will be available for you when adding a new regisration.</p>
                <ChipSet type="filter">
                    {tasks}
                </ChipSet>

                <h3 className="mdc-typography--subtitle1">Pick your default task</h3>
                <p>This task will be selected by default when you create a new registration.</p>
                <ChipSet type="choice">
                    {userTasksChips}
                </ChipSet>
            </Box>
        );
    }

    taskClicked = (id: string, selected: boolean) => {
        if (!store.user.user || !store.user.user.data) return;

        if (store.user.user.data.tasks) {

            if (selected) store.user.user.data.tasks.set(id, true);
            else store.user.user.data.tasks.delete(id);

            store.user.save();
        }
    }

    defaultTaskChanged = (id: string) => {
        if (!store.user.user || !store.user.user.data) return;

        if (store.user.user.data.tasks) {

            store.user.user.data.defaultTask = id;

            store.user.save();
        }
    }
}