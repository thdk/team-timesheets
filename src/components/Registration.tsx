import * as React from 'react';
import { observer } from "mobx-react";
import { TextField } from '../MaterialUI/textfield';
import { Form } from '../MaterialUI/form';
import store from '../store';
import moment from 'moment-es6';

export interface IRegistrationProps {
    moment: moment.Moment;
}

@observer
export class Registration extends React.Component<{}, { moment: moment.Moment }> {
    constructor(props: IRegistrationProps) {
        super(props);
        this.state = {
            moment: store.moment
        }
    }

    render() {
        return (
            <Form>
                <TextField value={`${this.state.moment.year()}-${this.state.moment.month() + 1}-${this.state.moment.date()}`} id="date" hint="Date" leadingIcon="event" outlined={true}></TextField>
                <TextField id="description" hint="Description" fullWidth={true}></TextField>
                <TextField id="project" hint="Project" fullWidth={true}></TextField>
                <TextField id="time" hint="Time" fullWidth={true}></TextField>
            </Form>
        );
    }
}