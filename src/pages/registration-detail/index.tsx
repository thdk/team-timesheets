import * as React from 'react';
import { observer } from "mobx-react";
import { Chip, ChipSet } from '@material/react-chips';

import { Form, FormField } from '../../components/layout/form';
import { FlexGroup } from '../../components/layout/flex';
import store from '../../stores/root-store';
import ProjectSelect from '../../containers/projects/select';
import ClientSelect from '../../containers/clients/select';
import { withAuthentication } from '../../containers/users/with-authentication';
import { RedirectToLogin } from '../../internal';
import { TextField } from '@rmwc/textfield';

@observer
class Registration extends React.Component {
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
                            <TextField
                                type="number"
                                outlined={true}
                                autoFocus={true}
                                tabIndex={0}
                                onChange={this.onTimeChange}
                                value={(time || "").toString()}
                                id="time"
                                label="Time"
                            />
                        </FormField>
                        <FormField first={false}>
                            <TextField
                                tabIndex={-1}
                                disabled={true}
                                value={`${date!.getFullYear()}-${date!.getMonth() + 1}-${date!.getDate()}`}
                                id="date"
                                label="Date"
                                icon="event"
                                outlined={true} />
                        </FormField>
                    </FlexGroup>
                    <FlexGroup extraCssClass="row">
                        <FormField>
                            <TextField
                                textarea
                                cols={250}
                                rows={2}
                                outlined={true}
                                tabIndex={0}
                                onChange={this.onDescriptionChange}
                                value={description}
                                id="description"
                                label="Description"
                                fullwidth
                            />
                        </FormField>
                    </FlexGroup>
                    <FlexGroup>
                        <FormField>
                            <ProjectSelect></ProjectSelect>
                        </FormField>
                        <FormField first={false}>
                            <ClientSelect
                                onChange={this.onClientChange}
                                value={client}>
                            </ClientSelect>
                        </FormField>
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

    onDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (store.timesheets.registration && store.timesheets.registration)
            store.timesheets.registration.description = event.currentTarget.value.trimLeft();
    }

    onTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (store.timesheets.registration && store.timesheets.registration)
            store.timesheets.registration.time = +(event.currentTarget.value);
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

export default withAuthentication(
    Registration,
    <RedirectToLogin />,
);
