import * as React from 'react';
import { observer } from "mobx-react";
import { Chip, ChipSet } from '@material/react-chips';

import { TextField } from '../mdc/textfield';
import { Form, FormField } from '../components/Layout/form';
import { FlexGroup } from './Layout/flex';
import store from '../stores/RootStore';
import ProjectSelect from './Pages/Timesheets/ProjectSelect';
import ClientSelect from './Pages/Timesheets/ClientSelect';

@observer
export class Registration extends React.Component {
    render() {
        if (!store.timesheets.registration || !store.user.authenticatedUser) {
            return <></>;
        }

        if (!store.timesheets.registration || !store.user.userId) return <></>;

        const userTasks = Array.from(store.user.authenticatedUser.tasks.keys());
        const { task,
            description,
            time,
            date,
            client
        } = store.timesheets.registration;

        const tasks = Array.from(store.config.tasks.docs.values())
            .filter(t => t.data && userTasks.length ? userTasks.some(userTaskId => userTaskId === t.id) : true)
            .map(t => {
                const { id: taskId, data: { name: taskName = "N/A", icon: taskIcon = undefined } = {} } = t;
                const leadingIcon = taskIcon ? <i className="material-icons mdc-chip__icon mdc-chip__icon--leading">{taskIcon}</i> : undefined;
                return (
                    <Chip leadingIcon={leadingIcon} handleSelect={this.taskClicked} id={taskId} label={taskName!} key={taskId}></Chip>
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
                        <ClientSelect onChange={this.onClientChange} value={client}></ClientSelect>
                    </FlexGroup>
                    <FlexGroup extraCssClass="row">
                        <FlexGroup direction="vertical">
                            <h3 className="mdc-typography--subtitle1">Select one of your standard tasks</h3>
                            <FormField>
                                <ChipSet selectedChipIds={task ? [task] : undefined} choice={true}>{tasks}</ChipSet>
                            </FormField>
                        </FlexGroup>
                    </FlexGroup>
                </Form>
            </>
        );
    }

    onDescriptionChange = (value: string) => {
        if (store.timesheets.registration && store.timesheets.registration)
            store.timesheets.registration.description = value.trimLeft();
    }

    onTimeChange = (value: string) => {
        if (store.timesheets.registration && store.timesheets.registration)
            store.timesheets.registration.time = +value;
    }

    taskClicked = (taskId: string, selected: boolean) => {
        if (store.timesheets.registration && store.timesheets.registration.task !== taskId && selected)
            store.timesheets.registration.task = taskId;
    }

    onClientChange = (value: string) => {
        if (store.timesheets.registration && store.timesheets.registration)
            store.timesheets.registration.client = value;
    }
}