import * as React from "react";
import { observer } from 'mobx-react-lite';
import { Doc } from "firestorable";
import { IRegistration, IRegistrationData } from '../../../../common';
import RegistrationLine from "../line";
import { useStore } from "../../../contexts/store-context";

export interface IRegistrationLinesProps extends React.HTMLProps<HTMLElement> {
    readonly registrations: Doc<Omit<IRegistration, "date" | "isPersisted">, Omit<IRegistrationData, "date">>[];
    readonly registrationToggleSelect?: (id: string) => void;
    readonly registrationClick: (id: string) => void;
}

export const RegistrationLines = observer((props: IRegistrationLinesProps) => {
    const store = useStore();

    const { registrations, registrationToggleSelect, registrationClick, readOnly } = props;

    const rows = registrations.map(r => {
        if (!r.data) throw new Error("Found registration without Data");

        const { id, data: { description = "...", project, time, task, client } } = r;

        const projectData = project ? store.projects.projectsCollection.get(project) : null;
        const { data: { name: projectName = "" } = {} } = projectData || {};

        const taskData = task ? store.config.tasks.get(task) : null;
        const { data: { icon = undefined } = {} } = taskData || {};

        const clientData = client ? store.config.clientsCollection.get(client) : null;
        const { data: { name: clientName = undefined } = {} } = clientData || {};

        const line1 = projectName;
        const line2 = `${clientName ? clientName + " - " : ""}${description}`;

        const onSelect = registrationToggleSelect ? () => registrationToggleSelect(id) : undefined;


        const listItemOnClick = () => registrationClick(id);
        return <RegistrationLine
            readOnly={readOnly}
            icon={icon}
            id={id}
            key={id}
            line1={line1}
            line2={line2}
            time={time}
            onClick={listItemOnClick}
            onSelect={onSelect}>
        </RegistrationLine>
    });

    return <>{rows}</>;
});