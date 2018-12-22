import * as React from 'react';
import { observer } from "mobx-react";
import { Fab } from "../MaterialUI/buttons";
import routes from '../routes/index';
import { goToRegistration } from '../internal';
import store from '../stores/RootStore';
import { FlexGroup } from './Layout/flex';
import { goToOverview } from '../routes/timesheets/overview';
import { GroupedRegistration } from './GroupedRegistration';

@observer
export class Timesheets extends React.Component {

    registrationClick = (id: string) => {
        goToRegistration(id);
    }

    createTotalLabel = (_date: Date) => {
        return `Total`;
    }

    goToMonth(e: React.MouseEvent) {
        e.preventDefault();
        goToOverview(store, {
            year: store.view.year!,
            month: store.view.month!
        });
    }

    render() {
        const group = store.timesheets.registrationsGroupedByDay.filter(g => g.date.getDate() === store.view.day);

        const registrations = group.length
            ? <GroupedRegistration group={group[0]} createTotalLabel={this.createTotalLabel} registrationClick={this.registrationClick.bind(this)} />
            : <></>;

        const title = store.view.day
            ? <>Timesheet <a href="#" onClick={this.goToMonth}>{store.view.moment.format('MMMM')}</a> {store.view.moment.format('D, YYYY')}</>
            : `Timesheet ${store.view.moment.format('MMMM YYYY')}`;
        return (
            <>
                <FlexGroup direction="vertical">
                    <div style={{ paddingLeft: "1em" }}>
                        <h3 className="mdc-typography--subtitle1">
                            {title}
                        </h3>
                    </div>
                    {registrations}
                </FlexGroup>
                <Fab onClick={this.addRegistration} icon="add" name="Add new registration"></Fab>
            </>
        );
    }

    addRegistration = () => {
        store.router.goTo(routes.newRegistration, {}, store);
    }
}