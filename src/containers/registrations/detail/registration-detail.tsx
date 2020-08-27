import React, { useCallback } from "react";
import { observer } from "mobx-react-lite";
import { useRegistrationStore } from '../../../contexts/registration-context';
import { Form, FormField } from "../../../components/layout/form";
import { FlexGroup } from "../../../components/layout/flex";
import { TextField } from "@rmwc/textfield";
import { ProjectSelect } from "../../projects/select";
import ClientSelect from "../../clients/select";
import { TasksChips } from "../../tasks/chips";
import { useUserStore } from "../../../contexts/user-context";
import { useTasks } from "../../../contexts/task-context";

export const RegistrationDetail = observer(() => {
    const user = useUserStore();
    const timesheets = useRegistrationStore();
    const tasksStore = useTasks();

    const onDescriptionChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        if (timesheets.registration && timesheets.registration)
            timesheets.registration.description = event.currentTarget.value.trimLeft();
    }, [timesheets.registration]);

    const onTimeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        if (timesheets.registration && timesheets.registration)
            timesheets.registration.time = +(event.currentTarget.value);
    }, [timesheets.registration]);

    const taskClicked = useCallback((taskId: string) => {
        if (timesheets.registration && timesheets.registration.task !== taskId)
            timesheets.registration.task = taskId;
    }, [timesheets.registration]);

    const onClientChange = useCallback((value: string) => {
        if (timesheets.registration)
            timesheets.registration.client = value;
    }, [timesheets.registration]);

    if (!user.authenticatedUser) {
        return <></>;
    }

    if (!timesheets.registration || !user.authenticatedUser) return <></>;

    const userTasks = Array.from(user.authenticatedUser.tasks.keys());
    const tasks = tasksStore.tasks
        .filter(t => userTasks.length ? userTasks.some(userTaskId => userTaskId === t.id) : true)


    const {
        description,
        time,
        date,
        client,
        task,
    } = timesheets.registration;

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
                            onChange={onTimeChange}
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
                            onChange={onDescriptionChange}
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
                            onChange={onClientChange}
                            value={client}>
                        </ClientSelect>
                    </FormField>
                </FlexGroup>
                <FlexGroup extraCssClass="row">
                    <FlexGroup direction="vertical">
                        <h3 className="mdc-typography--subtitle1">Select one of your standard tasks</h3>
                        <FormField>
                            <TasksChips
                                onTaskInteraction={taskClicked}
                                selectedTaskIds={task ? [task] : undefined}
                                choice
                                tasks={tasks}
                            />
                        </FormField>
                    </FlexGroup>
                </FlexGroup>
            </Form>
        </>
    );
});
