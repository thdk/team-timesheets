import * as React from 'react';
import { observer } from 'mobx-react';
import store from '../../stores/RootStore';
import { Chip, ChipSet } from '../../MaterialUI/chips';
import { Doc } from '../../Firestorable/Document';
import { IUser } from '../../stores/UserStore';
import { toJS } from 'mobx';

@observer
export class Preferences extends React.Component {
    render() {
        const { tasks: userTasks = undefined } = (store.user.user as Doc<IUser>).data || {};
        const tasks = Array.from(store.config.tasks.docs.values())
            .filter(t => !!t.data && t instanceof(Doc)) // todo move validation to Doc
            .map(t => {
                const { id: taskId, data: { name: taskName } = { name: "UNKNOWN" } } = t;

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
        if (!(store.user.user instanceof(Doc)) || !store.user.user.data) return;

        if (store.user.user.data.tasks) {
            console.log(toJS(store.user.user.data.tasks));

            if (selected) store.user.user.data.tasks.set(id, true);
            else store.user.user.data.tasks.delete(id);

            store.user.save();
        }
    }
}