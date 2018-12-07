import * as React from 'react';
import { observer } from "mobx-react";
import { TextField } from '../MaterialUI/textfield';
import { Form } from '../MaterialUI/form';
import store from '../store';
import { Chip, ChipSet } from '../MaterialUI/chips';
import { Doc } from '../Firestorable/Document';

@observer
export class Registration extends React.Component {
    render() {
        if (!(store.registrationsStore.registration instanceof (Doc))) return <></>;

        const { task = store.user.defaultTask, description, project, time, date } = store.registrationsStore.registration.data;
        const tasks = Array.from(store.tasks.docs.values()).map((t, i) => {
            const { name: taskName, id: taskId } = t.data;

            return (
                <Chip onClick={this.taskClicked} {...t.data} text={taskName} key={taskId} isSelected={taskId === task}></Chip>
            );
        });

        const realDate = date.toDate();

        return (
            <Form>
                <TextField tabIndex={-1} disabled={true} value={`${realDate.getFullYear()}-${realDate.getMonth() + 1}-${realDate.getDate()}`} id="date" hint="Date" leadingIcon="event" outlined={true}></TextField>

                <TextField outlined={true} focus={true} tabIndex={0} onChange={this.onDescriptionChange} value={description} id="description" hint="Description" fullWidth={false}></TextField>
                <TextField outlined={true} tabIndex={0} onChange={this.onProjectChange} value={project} id="project" hint="Project" fullWidth={false}></TextField>
                <TextField outlined={true} tabIndex={0} onChange={this.onTimeChange} value={(time || "").toString()} id="time" hint="Time" fullWidth={false}></TextField>
                <ChipSet type="choice">
                    {tasks}
                </ChipSet>
            </Form>
        );
    }

    onDescriptionChange = (value: string) => {
        if (store.registrationsStore.registration instanceof (Doc))
            store.registrationsStore.registration.data.description = value;
    }

    onTimeChange = (value: string) => {
        if (store.registrationsStore.registration instanceof (Doc))
            store.registrationsStore.registration!.data.time = +value;
    }

    onProjectChange = (value: string) => {
        if (store.registrationsStore.registration instanceof (Doc))
            store.registrationsStore.registration!.data.project = value;
    }

    taskClicked = (taskId: string) => {
        if (store.registrationsStore.registration instanceof (Doc))
            store.registrationsStore.registration!.data.task = taskId;
    }
}