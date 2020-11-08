import * as React from "react";
import { observer } from 'mobx-react-lite';
import { Doc } from "firestorable";
import { IRegistration, IRegistrationData } from '../../../../common';
import { RegistrationLine } from "../line";
import { useProjectStore } from "../../../stores/project-store";
import { useTasks } from "../../../contexts/task-context";
import { useClients } from "../../../contexts/client-context";

export interface IRegistrationLinesProps extends React.HTMLProps<HTMLElement> {
    readonly registrations: Doc<Omit<IRegistration, "date" | "isPersisted">, Omit<IRegistrationData, "date">>[];
    readonly registrationToggleSelect?: (id: string) => void;
    readonly registrationClick?: (id: string) => void;
}

export const RegistrationLines = observer((props: IRegistrationLinesProps) => {
    const projects = useProjectStore();
    const tasks = useTasks();
    const clients = useClients();

    const { registrations, registrationToggleSelect, registrationClick } = props;

    const rows = registrations.map(r => {
        if (!r.data) return;

        const { id, data: { description = "...", project, time, task, client } } = r;

        const projectData = project ? projects.collection.get(project) : null;
        const { data: { name: projectName = "" } = {} } = projectData || {};

        const taskData = task ? tasks.get(task) : null;
        const { data: { icon = undefined, name: taskName = "" } = {} } = taskData || {};

        const clientData = client ? clients.get(client) : null;
        const { data: { name: clientName = undefined } = {} } = clientData || {};

        const line1 = projectName;
        const line2 = `${clientName ? clientName + " - " : ""}${description}`;

        return (
            <RegistrationLine
                readOnly={!registrationClick}
                icon={icon ? {
                    icon,
                    title: taskName,
                } : undefined}
                id={id}
                key={id}
                line1={line1}
                line2={line2}
                time={time}
                onClick={
                    registrationClick
                        ? () => registrationClick(id)
                        : undefined
                }
                onSelect={registrationToggleSelect
                    ? () => registrationToggleSelect(id)
                    : undefined}>
            </RegistrationLine>
        );
    });

    return <>{rows}</>;
});