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

        const userTasks = store.user.authenticatedUser.tasks;
        const userTasksChips = Array.from(userTasks.keys()).map(t => {
            const taskData = store.config.tasks.docs.get(t);
            const { id: taskId = "", data: { name: taskName = "ARCHIVED" } = {} } = taskData || {};
            return <Chip label={taskName}
                handleSelect={this.onClick.bind(this)}
                id={taskId}
                key={taskId}>
            </Chip>;
        })
        return (
            <>
                <h3 className="mdc-typography--subtitle1">Pick your default task</h3>
                <p>This task will be selected by default when you create a new registration.</p>
                <ChipSet selectedChipIds={Array.from(userTasks.keys())} choice={true}>{userTasksChips}</ChipSet>
            </>
        );
    }

    onClick(selectedTaskId: string, selected: boolean) {
        if (selected && this.props.value !== selectedTaskId) {
            this.props.onChange && this.props.onChange(selectedTaskId);
        }
    }
}