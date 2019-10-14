import * as React from "react";
import store from '../../../stores/RootStore';
import { observer } from 'mobx-react';
import { Doc } from "firestorable";
import { IRegistration, IRegistrationData } from '../../../../common';
import RegistrationLine from "../../registrations/RegistrationLine";

export interface IRegistrationLinesProps extends React.HTMLProps<HTMLElement> {
    readonly registrations: Doc<IRegistration, IRegistrationData>[];
    readonly registrationToggleSelect?: (id: string, data: IRegistration) => void;
    readonly registrationClick: (id: string) => void;
}

export const RegistrationLines = observer((props: IRegistrationLinesProps) => {

    const { registrations, registrationToggleSelect, registrationClick } = props;

    const rows = registrations.map(r => {
        if (!r.data) throw new Error("Found registration without Data");

        const { id, data: { description = "...", project, time, task, client } } = r;

        const projectData = project ? store.projects.projectsCollection.docs.get(project) : null;
        const { data: { name: projectName = "" } = {} } = projectData || {};

        const taskData = task ? store.config.tasks.docs.get(task) : null;
        const { data: { icon = undefined } = {} } = taskData || {};

        const clientData = client ? store.config.clientsCollection.docs.get(client) : null;
        const { data: { name: clientName = undefined } = {} } = clientData || {};

        const line1 = projectName;
        const line2 = `${clientName ? clientName + " - " : ""}${description}`;

        const onSelect = registrationToggleSelect ? () => registrationToggleSelect(id, r.data!) : undefined;


        const listItemOnClick = () => registrationClick(id);
        return <RegistrationLine
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