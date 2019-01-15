import * as React from 'react';
import store from '../stores/RootStore';
import { ListItem, List, ListDivider } from '../MaterialUI/list';
import { IGroupedRegistrations } from '../stores/TimesheetsStore';
import { observer } from 'mobx-react';
import { Checkbox } from '../MaterialUI/checkbox';
import { FlexGroup } from './Layout/flex';


export interface IGroupedRegistrationProps {
    group: IGroupedRegistrations;
    registrationClick: (id: string) => void;
    createTotalLabel: (date:Date) => React.ReactNode;
    totalOnTop?: boolean;
}

@observer
export class GroupedRegistration extends React.Component<IGroupedRegistrationProps> {
    render() {
        const {group: {registrations, date, totalTime}, createTotalLabel, totalOnTop, registrationClick} = this.props;
        const listStyle = { width: '100%' };
        const rows = registrations.map(r => {
            if (!r.data) throw new Error("Found registration without Data");

            const { id, data: { description = "...", project, time, task } } = r;

            const projectData = project ? store.config.projects.docs.get(project) : null;
            const { data: { name: projectName = "" } = {} } = projectData || {};

            const taskData = task ? store.config.tasks.docs.get(task) : null;
            const { data: { name: taskName = "N/A", icon = undefined } = {} } = taskData || {};

            const line1 = projectName;
            const line2 = `${taskName} - ${description}`;

            const meta =
                <FlexGroup>
                    <div><Checkbox onChange={() => {}}></Checkbox></div>
                    <div>{time + " hours"}</div>
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

            const total = <ListItem lines={[totalLabel]} meta={totalTime + " hours"} disabled={true}></ListItem>

            const totalList = <List style={listStyle}><ListDivider></ListDivider>{total}<ListDivider></ListDivider></List>;
            const topTotal = totalOnTop ? totalList : undefined;
            const bottomTotal = totalOnTop ? undefined : totalList;

            return (
            <React.Fragment>
                {topTotal}
                <List isTwoLine={true} style={listStyle}>
                    {rows}
                </List>
                {bottomTotal}
            </React.Fragment>
        );
    }
}