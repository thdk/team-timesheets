import * as React from 'react';
import { observer } from "mobx-react";
import { TextField } from '../MaterialUI/textfield';
import { Form, FormField } from '../components/Layout/form';
import { Chip, ChipSet } from '../MaterialUI/chips';
import { Doc } from '../Firestorable/Document';
import { FlexGroup } from './Layout/flex';
import { Select, SelectOption } from '../MaterialUI/select';
import store from '../stores/RootStore';

@observer
export class Registration extends React.Component {
    render() {
        if (!store.timesheets.registration ||!store.user.user) {
            return <></>;
        }

        if (!store.timesheets.registration.data || !store.user.userId) return <></>;

        const userTasks = Array.from(store.user.user!.data!.tasks.keys());
        const { task, 
            description, 
            project, 
            time, 
            date 
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

        const projects = Array.from(store.config.projects.docs.values())
            .reduce((p, c) => {
                if (c.data) {
                    const { id, data: { name } } = c;
                    p.push(
                        <SelectOption text={name!} value={id} key={id}></SelectOption>
                    );
                }
                return p;
            }, new Array());

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
                        <FormField>
                            <Select value={project} outlined={true} label="Project" onChange={this.onProjectChange}>
                                {projects}
                            </Select>
                        </FormField>
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
        if (store.timesheets.registration && store.timesheets.registration instanceof (Doc) && store.timesheets.registration.data)
            store.timesheets.registration.data.description = value;
    }

    onTimeChange = (value: string) => {
        if (store.timesheets.registration && store.timesheets.registration instanceof (Doc) && store.timesheets.registration.data)
            store.timesheets.registration.data.time = +value;
    }

    onProjectChange = (value: string) => {
        if (store.timesheets.registration && store.timesheets.registration instanceof (Doc) && store.timesheets.registration.data)
            store.timesheets.registration.data.project = value;
    }

    taskClicked = (taskId: string) => {
        if (store.timesheets.registration && store.timesheets.registration instanceof (Doc) && store.timesheets.registration.data)
            store.timesheets.registration.data.task = taskId;
    }
}