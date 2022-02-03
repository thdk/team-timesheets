import React, { useCallback } from "react";
import { observer } from "mobx-react-lite";
import { useRegistrationStore } from '../../../contexts/registration-context';
import { Form, FormField } from "../../../components/layout/form";
import { FlexGroup } from "../../../components/layout/flex";
import { TextField } from "@rmwc/textfield";
import { ProjectSelect } from "../../projects/select/project-select";
import ClientSelect from "../../clients/select";
import { TasksChips } from "../../tasks/chips";
import { useUserStore } from "../../../contexts/user-context";
import { useTasks } from "../../../contexts/task-context";

const Tasks = observer(() => {
    const timesheets = useRegistrationStore();
    const tasksStore = useTasks();
    const user = useUserStore();

    const taskClicked = useCallback((taskId: string) => {
        if (timesheets.activeDocument && timesheets.activeDocument.task !== taskId)
            timesheets.activeDocument.task = taskId;
    }, [timesheets.activeDocument]);

    if (!user.divisionUser || !timesheets.activeDocument) {
        return null;
    }

    const userTasks = Array.from(user.divisionUser.tasks.keys());
    const tasks = tasksStore.tasks
        .filter(t => userTasks.length ? userTasks.some(userTaskId => userTaskId === t.id) : true)

    const { task } = timesheets.activeDocument;

    return tasks.length
        ? (
            <FlexGroup column>
                <h3 className="mdc-typography--subtitle1">Task</h3>
                <FormField>
                    <TasksChips
                        onTaskInteraction={taskClicked}
                        selectedTaskIds={task ? [task] : undefined}
                        choice
                        tasks={tasks}
                    />
                </FormField>
            </FlexGroup>
        )
        : null;
});

export const RegistrationDetail = observer(() => {
    const user = useUserStore();
    const timesheets = useRegistrationStore();

    const onDescriptionChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        if (timesheets.activeDocument && timesheets.activeDocument)
            timesheets.activeDocument.description = event.currentTarget.value.trimLeft();
    }, [timesheets.activeDocument]);

    const onTimeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        if (timesheets.activeDocument && timesheets.activeDocument)
            timesheets.activeDocument.time = +(event.currentTarget.value);
    }, [timesheets.activeDocument]);

    const onClientChange = useCallback((value: string) => {
        if (timesheets.activeDocument)
            timesheets.activeDocument.client = value;
    }, [timesheets.activeDocument]);

    const onProjectChange = useCallback((value: string) => {
        if (timesheets.activeDocument)
            timesheets.activeDocument.project = value;
    }, [timesheets.activeDocument]);

    if (!timesheets.activeDocument || !user.divisionUser) return <></>;

    const {
        description,
        time,
        date,
        client,
        project,
    } = timesheets.activeDocument;

    return (
        <>
            <Form>
                <FlexGroup className="row">
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
                <FlexGroup className="row">
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
                        <ProjectSelect
                            onChange={onProjectChange}
                            value={project}
                        />
                    </FormField>
                    <FormField first={false}>
                        <ClientSelect
                            onChange={onClientChange}
                            value={client}
                        />
                    </FormField>
                </FlexGroup>
                <FlexGroup className="row">
                    <Tasks />
                </FlexGroup>
            </Form>
        </>
    );
});
