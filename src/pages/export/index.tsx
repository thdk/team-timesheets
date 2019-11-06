import * as React from 'react';
import { observer } from "mobx-react";
import { goToRegistration } from '../../internal';
import store from '../../stores/root-store';
import { Days, SortOrder } from '../../containers/registrations/days';
import { goToOverview } from '../../routes/registrations/overview';
import { List, ListItem, ListDivider } from '../../mdc/list';
import { DateSelect } from '../../components/date-select';
import { ButtonType, Button } from '../../mdc/buttons/button';
import { FlexGroup } from '../../components/Layout/flex';
import { withAuthentication } from '../../containers/users/with-authentication';
import { RedirectToLogin } from '../../routes/login';

@observer
class Reports extends React.Component {

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
        }, { track: true });
    }

    render() {
        if (!store.view.moment) return null;

        const totalTime = store.timesheets.registrationsTotalTime;

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
                    <Days
                        sortOrder={SortOrder.Ascending}
                        totalOnTop={true}
                        registrationClick={this.registrationClick.bind(this)}
                        isMonthView={true}
                        showHeaderAddButton={false}
                    />
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

export default withAuthentication(
    Reports,
    <RedirectToLogin />,
);
