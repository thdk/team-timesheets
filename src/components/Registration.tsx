import * as React from 'react';
import { observer } from "mobx-react";
import { TextField } from '../MaterialUI/textfield';
import { Form } from '../MaterialUI/form';
import store from '../store';
import moment from 'moment-es6';
import { Chip, ChipSet } from '../MaterialUI/chips';

export interface IRegistrationProps {
    moment: moment.Moment;
}

@observer
export class Registration extends React.Component<{}, { moment: moment.Moment, task: string }> {
    constructor(props: IRegistrationProps) {
        super(props);
        this.state = {
            moment: store.moment,
            task: "HIBd74BItKoURLdQJmLf"
        }
    }

    render() {

        const tasks = Array.from(store.tasks.docs.values()).map((t, i) => {
            return (
                <Chip onClick={this.taskClicked} {...t} text={t.name} key={t.id} tabIndex={i} isSelected={t.id === this.state.task}></Chip>
            );
        });
        return (
            <Form>
                <TextField value={`${this.state.moment.year()}-${this.state.moment.month() + 1}-${this.state.moment.date()}`} id="date" hint="Date" leadingIcon="event" outlined={true}></TextField>
                <TextField id="description" hint="Description" fullWidth={true}></TextField>
                <TextField id="project" hint="Project" fullWidth={true}></TextField>
                <TextField id="time" hint="Time" fullWidth={true}></TextField>
                <ChipSet type="choice">
                    {tasks}
                </ChipSet>
            </Form>
        );
    }

    taskClicked = (taskId: string) => {
        this.setState({task: taskId});
    }
}