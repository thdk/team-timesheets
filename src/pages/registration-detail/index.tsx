import * as React from 'react';
import { observer } from "mobx-react";
import { Chip, ChipSet } from '@material/react-chips';

import { Form, FormField } from '../../components/layout/form';
import { FlexGroup } from '../../components/layout/flex';
import { ProjectSelect } from '../../containers/projects/select';
import ClientSelect from '../../containers/clients/select';
import { withAuthentication } from '../../containers/users/with-authentication';
import { RedirectToLogin } from '../../internal';
import { TextField } from '@rmwc/textfield';
import { StoreContext } from '../../contexts/store-context';

@observer
class Registration extends React.Component {
    declare context: React.ContextType<typeof StoreContext>
    static contextType = StoreContext;

    render() {
        if (!this.context.user.authenticatedUser) {
            return <></>;
        }

        if (!this.context.timesheets.registration || !this.context.user.authenticatedUserId) return <></>;

        const userTasks = Array.from(this.context.user.authenticatedUser.tasks.keys());
        const { task,
            description,
            time,
            date,
            client
        } = this.context.timesheets.registration;

        const tasks = this.context.config.tasks
            .filter(t => userTasks.length ? userTasks.some(userTaskId => userTaskId === t.id) : true)
            .map(t => {
                const { id: taskId, name: taskName = "N/A", icon: taskIcon = undefined } = t;
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
        if (this.context.timesheets.registration && this.context.timesheets.registration)
            this.context.timesheets.registration.description = event.currentTarget.value.trimLeft();
    }

    onTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (this.context.timesheets.registration && this.context.timesheets.registration)
            this.context.timesheets.registration.time = +(event.currentTarget.value);
    }

    taskClicked = (taskId: string, selected: boolean) => {
        if (this.context.timesheets.registration && this.context.timesheets.registration.task !== taskId && selected)
            this.context.timesheets.registration.task = taskId;
    }

    onClientChange = (value: string) => {
        if (this.context.timesheets.registration && this.context.timesheets.registration)
            this.context.timesheets.registration.client = value;
    }
}

export default withAuthentication(
    Registration,
    <RedirectToLogin />,
);
