import * as React from 'react';
import { observer } from "mobx-react";
import moment from 'moment-es6';
import { goToRegistration } from '../../internal';
import store from '../../stores/RootStore';
import { FlexGroup } from '../Layout/flex';
import { GroupedRegistrations } from '../GroupedRegistrations';
import { goToOverview } from '../../routes/timesheets/overview';
import { List, ListItem, ListDivider } from '../../MaterialUI/list';
import { DateSelect } from '../Controls/DateSelect';
import { Button, ButtonType } from '../../MaterialUI/buttons';

@observer
export class Reports extends React.Component {

    registrationClick = (id: string) => {
        goToRegistration(id);
    }

    goToDate(e: React.MouseEvent, date: Date) {
        e.preventDefault();
        store.view.track = true;
        goToOverview(store, {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate()
        }, {track: true});
    }

    createTotalLabel = (date: Date) => {
        return (
            <a href="#" onClick={(e) => this.goToDate(e, date)}>
                {moment(date).format("MMMM Do")}</a>
        );
    }

    render() {
        if (!store.view.moment) return null;
        
        const totalTime = Array.from(store.timesheets.registrations.docs.values())
            .reduce((p, c) => p + (c.data!.time || 0), 0);

        const totalLabel = `Total in ${store.view.moment.format('MMMM')}`;
        const total = <ListItem key={`total-month`} lines={[totalLabel]} meta={parseFloat(totalTime.toFixed(2)) + " hours"} disabled={true}></ListItem>

        const totalList = <List style={{ width: "100%" }}><ListDivider></ListDivider>{total}<ListDivider></ListDivider></List>;

        const { month, year } = store.view;

        const download = (store.reports.report && store.reports.report.data) ? store.reports.reportUrl
            ? <a href={store.reports.reportUrl}>Download report</a>
            : store.reports.report.data.status : undefined;
        const downloadReport = download &&
            <FlexGroup direction={"vertical"} style={{ paddingRight: "1em", alignItems: "flex-end" }}>{download}</FlexGroup>

        return (
            <>
                <FlexGroup direction="vertical">
                    <FlexGroup style={{ alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                        <DateSelect style={{ margin: "1em" }} onMonthChange={this.changeMonth} onYearChange={this.changeYear} month={month ? month - 1 : undefined} year={year}></DateSelect>
                        <Button onClick={this.export} style={{ margin: "1em" }} type={ButtonType.Outlined}>Export</Button>
                    </FlexGroup>
                    {downloadReport}
                    <GroupedRegistrations totalOnTop={true} createTotalLabel={this.createTotalLabel} registrationClick={this.registrationClick.bind(this)} />
                    {totalList}
                </FlexGroup>
            </>
        );
    }

    export = () => {
        store.user.userId
            && store.view.year
            && store.view.month
            && store.reports.requestReport(store.user.userId, store.view.year, store.view.month);
    }

    changeMonth(month: number) {
        store.view.month = month + 1;
    }

    changeYear(year: number) {
        store.view.year = year;
    }
}