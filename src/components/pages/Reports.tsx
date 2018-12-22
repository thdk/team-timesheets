import * as React from 'react';
import { observer } from "mobx-react";
import moment from 'moment-es6';
import { goToRegistration } from '../../internal';
import store from '../../stores/RootStore';
import { FlexGroup } from '../Layout/flex';
import { GroupedRegistrations } from '../GroupedRegistrations';
import { goToOverview } from '../../routes/timesheets/overview';
import { List, ListItem, ListDivider } from '../../MaterialUI/list';

@observer
export class Reports extends React.Component {

    registrationClick = (id: string) => {
        goToRegistration(id);
    }

    goToDate(e: React.MouseEvent, date: Date) {
        e.preventDefault();
        goToOverview(store, {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate()
        })
    }

    createTotalLabel = (date: Date) => {
        return (
            <>
                Total for <a href="#" onClick={(e) => this.goToDate(e, date)}>
                    {moment(date).format("MMMM Do")}</a>
            </>
        );
    }

    render() {
        const title = store.view.day
            ? `Timesheet ${store.view.moment.format('LL')}`
            : `Timesheet ${store.view.moment.format('MMMM YYYY')}`;

        const totalTime = store.timesheets.totalTime;

        const totalLabel = `Total in ${store.view.moment.format('MMMM')}`;
        const total = <ListItem key={`total-month`} lines={[totalLabel]} meta={totalTime + " hours"} disabled={true}></ListItem>

        const totalList = <List style={{ width: "100%" }}><ListDivider></ListDivider>{total}<ListDivider></ListDivider></List>;
        return (
            <>
                <FlexGroup direction="vertical">
                    <div style={{ paddingLeft: "1em" }}>
                        <h3 className="mdc-typography--subtitle1">
                            {title}
                        </h3>
                    </div>
                    <GroupedRegistrations totalOnTop={true} createTotalLabel={this.createTotalLabel} registrationClick={this.registrationClick.bind(this)} />
                    {totalList}
                </FlexGroup>
            </>
        );
    }
}