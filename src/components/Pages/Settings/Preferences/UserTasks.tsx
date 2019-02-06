import * as React from 'react';
import { IReactProps } from '../../../../types';
import store from '../../../../stores/RootStore';
import { Chip, ChipSet } from '../../../../MaterialUI/chips';
import { observer } from 'mobx-react';

export interface IUserTasksProps extends IReactProps {
    onChange: (taskId: string) => void;
    value?: string;
}

@observer
export class UserTasks extends React.Component<IUserTasksProps> {

    render() {
        if (!store.user.currentUser || store.config.tasks.docs.size === 0) return<></>;

        const userTasks = store.user.currentUser.tasks;
        const userTasksChips = Array.from(userTasks.keys()).map(t => {
            const taskData = store.config.tasks.docs.get(t);
            const { id: taskId = "", data: { name: taskName = "ARCHIVED" } = {} } = taskData || {};
            const isSelected = this.props.value === taskId;
            return <Chip type="choice" onClick={this.onClick.bind(this)} id={taskId} text={taskName!} key={taskId} isSelected={isSelected}></Chip>
        })
        return (
            <>
                <h3 className="mdc-typography--subtitle1">Pick your default task</h3>
                <p>This task will be selected by default when you create a new registration.</p>
                <ChipSet chips={userTasksChips} type="choice"></ChipSet>
            </>
        );
    }

    onClick(selectedTaskId: string) {
        if (this.props.value !== selectedTaskId) {
            this.props.onChange && this.props.onChange(selectedTaskId);
        }
    }
}