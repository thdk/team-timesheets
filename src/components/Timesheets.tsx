import * as React from 'react';
import { observer } from "mobx-react";
import { Fab } from "../MaterialUI/buttons";
import routes from '../routes/index';
import { goToRegistration } from '../internal';
import store from '../stores/RootStore';
import { ListItem, List, ListDivider } from '../MaterialUI/list';
import { FlexGroup } from './Layout/flex';

@observer
export class Timesheets extends React.Component {

    registrationClick = (id: string) => {
        goToRegistration(id);
    }

    render() {

        const rows = Array.from(store.timesheets.registrations.docs.values()).map(r => {
            if (!r.data || r.data.deleted) return;

            const { id, data: { description, project, time, date, task } } = r;

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
                    onClick={this.registrationClick.bind(this, id)}>
                </ListItem>
            );
        });

        const total = <ListItem lines={["TOTAL"]} meta={store.timesheets.totalTime + " uur"} disabled={true}></ListItem>

        const listStyle = { maxWidth: '900px', width: '100%' };
        return (
            <>
                <FlexGroup direction="vertical">
                    <div style={{ paddingLeft: "1em" }}>
                        <h3 className="mdc-typography--subtitle1">
                            {`Timesheet ${store.view.moment.format('LL')}`}
                        </h3>
                    </div>
                    <List isTwoLine={true} style={listStyle}>
                        {rows}
                        <ListDivider></ListDivider>
                    </List>
                    <List style={listStyle}>
                        {total}
                    </List>
                </FlexGroup>
                <Fab onClick={this.addRegistration} icon="add" name="Add new registration"></Fab>
            </>
        );
    }

    addRegistration = () => {
        store.router.goTo(routes.newRegistration, {}, store);
    }
}