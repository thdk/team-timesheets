import * as React from 'react';
import { observer } from "mobx-react";
import { TextField } from '../MaterialUI/textfield';
import { Form } from '../MaterialUI/form';
import store from '../store';
import { Chip, ChipSet } from '../MaterialUI/chips';


import * as firebase from "firebase/app";
import "firebase/firestore";
import moment from 'moment-es6';


@observer
export class Registration extends React.Component {
    constructor(props: {}) {
        super(props);
        store.registrationsStore.registration.date = firebase.firestore.Timestamp.fromDate(this.toUTC(
            store.view.moment.toDate())
        );
    }

    toUTC(date: Date) {
        return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
    }

    render() {
        const { task, description, project, time, date} = store.registrationsStore.registration;
        const tasks = Array.from(store.tasks.docs.values()).map((t, i) => {
            return (
                <Chip onClick={this.taskClicked} {...t} text={t.name} key={t.id} tabIndex={i} isSelected={t.id === (task || store.user.defaultTask)}></Chip>
            );
        });

        if (!date) return;

        const realDate = date.toDate();

        return (
            date &&
            <Form>
                <TextField disabled={true} value={`${realDate.getFullYear()}-${realDate.getMonth() + 1}-${realDate.getDate()}`} id="date" hint="Date" leadingIcon="event" outlined={true}></TextField>
                <TextField onChange={this.onDescriptionChange} value={description} id="description" hint="Description" fullWidth={true}></TextField>
                <TextField onChange={this.onProjectChange} value={project} id="project" hint="Project" fullWidth={true}></TextField>
                <TextField onChange={this.onTimeChange} value={(time || "").toString()} id="time" hint="Time" fullWidth={true}></TextField>
                <ChipSet type="choice">
                    {tasks}
                </ChipSet>
            </Form>
        );
    }

    onDescriptionChange = (value: string) => {
        store.registrationsStore.registration.description = value;
    }

    onTimeChange = (value: string) => {
        store.registrationsStore.registration.time = +value;
    }

    onProjectChange = (value: string) => {
        store.registrationsStore.registration.project = value;
    }

    taskClicked = (taskId: string) => {
        store.registrationsStore.registration.task = taskId;
    }
}