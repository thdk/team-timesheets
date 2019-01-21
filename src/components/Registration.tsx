import * as React from 'react';
import { observer } from "mobx-react";

import { TextField } from '../MaterialUI/textfield';
import { Form, FormField } from '../components/Layout/form';
import { Chip, ChipSet } from '../MaterialUI/chips';
import { FlexGroup } from './Layout/flex';
import store from '../stores/RootStore';
import ProjectSelect from './Pages/Timesheets/ProjectSelect';
import ClientSelect from './Pages/Timesheets/ClientSelect';

@observer
export class Registration extends React.Component {
    render() {
        if (!store.timesheets.registration || !store.user.user) {
            return <></>;
        }

        if (!store.timesheets.registration.data || !store.user.userId) return <></>;

        const userTasks = Array.from(store.user.user!.data!.tasks.keys());
        const { task,
            description,
            time,
            date,
        } = store.timesheets.registration.data;

        const tasks = Array.from(store.config.tasks.docs.values())
            .filter(t => userTasks.length ? userTasks.some(userTaskId => userTaskId === t.id) : true)
            .map(t => {
                if (!t.data) return;

                const { id: taskId, data: { name: taskName } } = t;

                return (
                    <Chip onClick={this.taskClicked} id={taskId} {...t.data} text={taskName!} key={taskId} isSelected={taskId === task}></Chip>
                );
            });



        return (
            <>
                <Form>
                    <FlexGroup extraCssClass="row">
                        <FormField>
                            <TextField type="number" outlined={true} focus={true} tabIndex={0} onChange={this.onTimeChange} value={(time || "").toString()} id="time" hint="Time" fullWidth={false}></TextField>
                        </FormField>
                        <FormField first={false}>
                            <TextField tabIndex={-1} disabled={true} value={`${date!.getFullYear()}-${date!.getMonth() + 1}-${date!.getDate()}`} id="date" hint="Date" leadingIcon="event" outlined={true}></TextField>
                        </FormField>
                    </FlexGroup>
                    <FlexGroup extraCssClass="row">
                        <FormField>
                            <TextField cols={250} rows={2} outlined={true} tabIndex={0} onChange={this.onDescriptionChange} value={description} id="description" hint="Description" fullWidth={false}></TextField>
                        </FormField>
                    </FlexGroup>
                    <FlexGroup>
                        <ProjectSelect></ProjectSelect>
                        <ClientSelect></ClientSelect>
                    </FlexGroup>
                    <FlexGroup extraCssClass="row">
                        <FlexGroup direction="vertical">
                            <h3 className="mdc-typography--subtitle1">Select one of your standard tasks</h3>
                            <FormField>
                                <ChipSet chips={tasks} type="choice"></ChipSet>
                            </FormField>
                        </FlexGroup>
                    </FlexGroup>
                </Form>
            </>
        );
    }

    onDescriptionChange = (value: string) => {
        if (store.timesheets.registration && store.timesheets.registration.data)
            store.timesheets.registration.data.description = value;
    }

    onTimeChange = (value: string) => {
        if (store.timesheets.registration && store.timesheets.registration.data)
            store.timesheets.registration.data.time = +value;
    }

    taskClicked = (taskId: string) => {
        if (store.timesheets.registration && store.timesheets.registration.data)
            store.timesheets.registration.data.task = taskId;
    }

    onClientChange = (value: string) => {
        if (store.timesheets.registration && store.timesheets.registration.data)
            store.timesheets.registration.data.client = value;
    }
}