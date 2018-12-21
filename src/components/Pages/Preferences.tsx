import * as React from 'react';
import { observer } from 'mobx-react';
import store from '../../stores/RootStore';
import { Chip, ChipSet } from '../../MaterialUI/chips';
import { Box } from '../Layout/box';

@observer
export class Preferences extends React.Component {
    render() {
        const { tasks: userTasks = new Map() } = store.user.user ? store.user.user.data || {} : {};
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
        return (
            <Box>
                <h3 className="mdc-typography--subtitle1">Pick your tasks</h3>
                <p>Only selected tasks will be available for you when adding a new regisration.</p>
                <ChipSet type="filter">
                    {tasks}
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
}