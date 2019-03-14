import * as React from 'react';
import { observer } from 'mobx-react';
import { Chip, ChipSet } from '@material/react-chips';

import store from '../../../../stores/RootStore';

export interface IUserTasksProps {
    onChange: (taskId: string) => void;
    value?: string;
}

@observer
export class UserTasks extends React.Component<IUserTasksProps> {

    render() {
        if (!store.user.authenticatedUser || store.config.tasks.docs.size === 0) return <></>;

        const { tasks: userTasks, defaultTask } = store.user.authenticatedUser;
        const userTasksChips = Array.from(userTasks.keys()).map(t => {
            const taskData = store.config.tasks.docs.get(t);
            const { id: taskId = "", data: { name: taskName = "ARCHIVED" } = {} } = taskData || {};
            return <Chip label={taskName}
                id={taskId}
                key={taskId}>
            </Chip>;
        })
        return (
            <>
                <h3 className="mdc-typography--subtitle1">Pick your default task</h3>
                <p>This task will be selected by default when you create a new registration.</p>
                <ChipSet handleSelect={this.handleSelect.bind(this)} selectedChipIds={defaultTask ? [defaultTask] : undefined} choice={true}>{userTasksChips}</ChipSet>
            </>
        );
    }

    handleSelect([selectedTaskId]: string[]) {
        if (!selectedTaskId) return;

        if (this.props.value !== selectedTaskId) {
            this.props.onChange && this.props.onChange(selectedTaskId);
        }
    }
}