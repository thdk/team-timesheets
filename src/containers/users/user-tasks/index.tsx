import * as React from 'react';
import { observer } from 'mobx-react';
import { Chip, ChipSet } from '@material/react-chips';
import { StoreContext } from '../../../contexts/store-context';

export interface IUserTasksProps {
    onChange: (taskId: string) => void;
    value?: string;
}

@observer
export class UserTasks extends React.Component<IUserTasksProps> {
    declare context: React.ContextType<typeof StoreContext>
    static contextType = StoreContext;

    render() {
        if (!this.context.user.authenticatedUser || this.context.config.tasksCollection.docs.length === 0) return <></>;

        const { tasks: userTasks, defaultTask } = this.context.user.authenticatedUser;
        const userTasksChips = Array.from(userTasks.keys()).map(t => {
            const taskData = this.context.config.tasksCollection.get(t);
            if (!taskData) return null;

            const { id: taskId = "", data: { name: taskName = "ARCHIVED", icon: taskIcon = undefined } = {} } = taskData || {};
            const leadingIcon = taskIcon ? <i className="material-icons mdc-chip__icon mdc-chip__icon--leading">{taskIcon}</i> : undefined;
            return <Chip label={taskName}
                leadingIcon={leadingIcon}
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