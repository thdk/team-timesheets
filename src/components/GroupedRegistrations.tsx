import * as React from 'react';
import store from '../stores/RootStore';
import { ListItem, List, ListDivider } from '../MaterialUI/list';
import { IReactProps } from '../types';
import { observer } from 'mobx-react';

export interface IGroupedRegistrationsProps extends IReactProps {
    registrationClick: (id: string) => void;
}

@observer
export class GroupedRegistrations extends React.Component<IGroupedRegistrationsProps> {
    render() {
        const listStyle = { maxWidth: '900px', width: '100%' };

        return store.timesheets.registrationsGroupedByDay.map((g, i) => {
            const rows = g.registrations.map(r => {
                if (!r.data) throw new Error("Found registration without Data");

                const { id, data: { description, project, time, task } } = r;

                const projectData = project ? store.config.projects.docs.get(project) : null;
                const { data: { name: projectName = "ARCHIVED" } = {} } = projectData || {};

                const taskData = task ? store.config.tasks.docs.get(task) : null;
                const { data: { name: taskName = "N/A", icon = undefined } = {} } = taskData || {};

                const line1 = projectName;
                const line2 = `${taskName} - ${description}`;
                return (
                    <ListItem
                        icon={icon}
                        key={id}
                        lines={[line1, line2]}
                        meta={time + " uur"}
                        onClick={this.props.registrationClick.bind(this, id)}>
                    </ListItem>
                );
            });

            const total = <ListItem key={`total-${i}`} lines={["TOTAL"]} meta={g.totalTime + " uur"} disabled={true}></ListItem>

            return (
                <React.Fragment key={`group-${i}`}>
                    <List isTwoLine={true} style={listStyle}>
                        {rows}
                    </List>
                    <ListDivider></ListDivider>
                    <List style={listStyle}>
                        {total}
                    </List>
                </React.Fragment>
            );
        });
    }
}