import * as React from 'react';
import store from '../../../stores/RootStore';
import { Checkbox } from '../../../mdc/checkbox';
import { FlexGroup } from '../../Layout/flex';
import { ListItem } from '../../../mdc/list';
import { observer } from 'mobx-react';
import { Doc } from '../../../Firestorable/Document';
import { IRegistration, IRegistrationData } from '../../../../common';

export interface IGroupedRegistrationItemsProps extends React.HTMLProps<HTMLElement> {
    readonly registrations: Doc<IRegistration, IRegistrationData>[];
    readonly registrationToggleSelect?: (id: string, data: IRegistration) => void;
    readonly registrationClick: (id: string) => void;
}

export const GroupedRegistrationItems = observer((props: IGroupedRegistrationItemsProps) => {

    const { registrations, registrationToggleSelect, registrationClick } = props;

    const rows = registrations.map(r => {
        if (!r.data) throw new Error("Found registration without Data");

        const { id, data: { description = "...", project, time, task, client } } = r;

        const projectData = project ? store.config.projects.docs.get(project) : null;
        const { data: { name: projectName = "" } = {} } = projectData || {};

        const taskData = task ? store.config.tasks.docs.get(task) : null;
        const { data: { icon = undefined } = {} } = taskData || {};

        const clientData = client ? store.config.clientsCollection.docs.get(client) : null;
        const { data: { name: clientName = undefined } = {} } = clientData || {};

        const line1 = projectName;
        const line2 = `${clientName ? clientName + " - " : ""}${description}`;

        const onClick = () => registrationToggleSelect ? registrationToggleSelect(id, r.data!) : undefined;
        const checkbox = registrationToggleSelect
            ? <div className="clickable"><Checkbox checked={store.view.selection.has(id)} onClick={onClick}></Checkbox></div>
            : undefined;

        const meta =
            <FlexGroup center={true} style={{ justifyContent: "space-between", width: checkbox ? "8em" : "auto" }}>
                <div>{`${time ? parseFloat(time.toFixed(2)) : 0}`}</div>
                {checkbox}
            </FlexGroup>;

        const listItemOnClick = () => registrationClick(id);
        return (
            <ListItem
                icon={icon}
                key={id}
                lines={[line1, line2]}
                meta={meta}
                onClick={listItemOnClick}>
            </ListItem>
        );
    });

    return <>{rows}</>;
});