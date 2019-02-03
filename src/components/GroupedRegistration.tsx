import * as React from 'react';
import store from '../stores/RootStore';
import { ListItem, List, ListDivider } from '../MaterialUI/list';
import { IGroupedRegistrations, IRegistration } from '../stores/TimesheetsStore';
import { observer } from 'mobx-react';
import { Checkbox } from '../MaterialUI/checkbox';
import { FlexGroup } from './Layout/flex';


export interface IGroupedRegistrationProps {
    group: IGroupedRegistrations;
    registrationClick: (id: string) => void;
    registrationToggleSelect?: (id: string, data: IRegistration) => void;
    createTotalLabel: (date: Date) => React.ReactNode;
    totalOnTop?: boolean;
    denseList?: boolean;
}

@observer
export class GroupedRegistration extends React.Component<IGroupedRegistrationProps> {
    private registrationRef: React.RefObject<HTMLDivElement>;
    constructor(props: IGroupedRegistrationProps) {
        super(props);
        this.registrationRef = React.createRef();
    }

    render() {
        const { denseList, group: { registrations, date, totalTime }, createTotalLabel, totalOnTop, registrationClick, registrationToggleSelect: registrationSelect } = this.props;
        const listStyle = { width: '100%' };
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

            const checkbox = registrationSelect
                ? <div className="clickable"><Checkbox checked={store.view.selection.has(id)} onClick={registrationSelect.bind(this, id, r.data!)}></Checkbox></div>
                : undefined;

            const meta =
                <FlexGroup center={true} style={{ justifyContent: "space-between", width: checkbox ? "8em" : "auto" }}>
                    <div>{`${time ? parseFloat(time.toFixed(2)) : 0}`}</div>
                    {checkbox}
                </FlexGroup>;

            return (
                <ListItem
                    icon={icon}
                    key={id}
                    lines={[line1, line2]}
                    meta={meta}
                    onClick={registrationClick.bind(this, id)}>
                </ListItem>
            );
        });
        const totalLabel = createTotalLabel(date);

        const total = <ListItem lines={[totalLabel]} meta={parseFloat(totalTime.toFixed(2)) + " hours"} disabled={true}></ListItem>

        const totalList = <List isDense={denseList} style={listStyle}><ListDivider></ListDivider>{total}<ListDivider></ListDivider></List>;
        const topTotal = totalOnTop ? totalList : undefined;
        const bottomTotal = totalOnTop ? undefined : totalList;

        return (
            <div ref={this.registrationRef}>
                {topTotal}
                <List isDense={denseList} isTwoLine={true} style={listStyle}>
                    {rows}
                </List>
                {bottomTotal}
            </div>
        );
    }

    public scrollIntoView() {
        this.registrationRef.current && this.registrationRef.current.scrollIntoView({ behavior: "smooth" });
    }
}