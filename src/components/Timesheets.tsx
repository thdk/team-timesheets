import * as React from 'react';
import { observer } from "mobx-react";
import moment from 'moment-es6';
import { Fab } from "../MaterialUI/buttons";
import routes from '../routes/index';
import { goToRegistration } from '../internal';
import store from '../stores/RootStore';
import { FlexGroup } from './Layout/flex';
import { goToOverview } from '../routes/timesheets/overview';
import { GroupedRegistration } from './GroupedRegistration';
import {GroupedRegistrations} from './GroupedRegistrations';

@observer
export class Timesheets extends React.Component {

    registrationClick = (id: string) => {
        goToRegistration(id);
    }

    createTotalLabel = (date: Date) => {
        return store.view.day
        ? `Total`
        : <a  href="#" onClick={(e) => this.goToDate(e, date)}>{moment(date).format("MMMM Do")}</a>;
    }

    goToDate(e: React.MouseEvent, date: Date) {
        e.preventDefault();
        goToOverview(store, {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate()
        })
    }

    goToMonth(e: React.MouseEvent) {
        e.preventDefault();
        goToOverview(store, {
            year: store.view.year!,
            month: store.view.month!
        });
    }

    render() {
        let regs: React.ReactNode;
        if (store.view.day) {
            const group = store.timesheets.registrationsGroupedByDay.filter(g => g.date.getDate() === store.view.day);

            regs = group.length
                ? <GroupedRegistration group={group[0]} createTotalLabel={this.createTotalLabel} registrationClick={this.registrationClick.bind(this)} />
                : <></>;
        } else {
            regs = <GroupedRegistrations totalOnTop={true} createTotalLabel={this.createTotalLabel} registrationClick={this.registrationClick.bind(this)}></GroupedRegistrations>
        }


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
                    {regs}
                </FlexGroup>
                {store.view.day && <Fab onClick={this.addRegistration} icon="add" name="Add new registration"></Fab>}
            </>
        );
    }

    addRegistration = () => {
        store.router.goTo(routes.newRegistration, {}, store);
    }
}