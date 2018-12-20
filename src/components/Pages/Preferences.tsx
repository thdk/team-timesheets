import * as React from 'react';
import { observer } from 'mobx-react';
import store from '../../stores/RootStore';
import { Chip, ChipSet } from '../../MaterialUI/chips';

@observer
export class Preferences extends React.Component {
    render() {
        const tasks = Array.from(store.config.tasks.docs.values())
            .filter(t => !!t.data.name) // todo move validation to Doc
            .map(t => {
                const { id: taskId, data: { name: taskName } } = t;

                const { tasks: userTasks = undefined } = store.user.user || {};
                const isSelected = userTasks && userTasks.get(taskId) === true;
                return (
                    <Chip type="filter" onClick={this.taskClicked} id={taskId} text={taskName!} key={taskId} isSelected={isSelected}></Chip>
                );
            });
        return (
            <>
                <ChipSet type="filter">
                    {tasks}
                </ChipSet>
            </>
        );
    }

    taskClicked = (id: string, selected: boolean) => {
        if (!store.user.user) return;

        if (store.user.user.tasks) {
            if (selected) store.user.user.tasks.set(id, true);
            else store.user.user.tasks.delete(id);

            store.user.save();
        }
    }
}