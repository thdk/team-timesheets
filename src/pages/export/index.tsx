import * as React from 'react';
import { observer } from "mobx-react";
import { goToRegistration } from '../../internal';
import { Days, SortOrder } from '../../containers/registrations/days';
import { goToOverview } from '../../routes/registrations/overview';
import { List, ListItem, ListDivider } from '../../mdc/list';
import { DateSelect } from '../../components/date-select';
import { ButtonType, Button } from '../../mdc/buttons/button';
import { FlexGroup } from '../../components/layout/flex';
import { withAuthentication } from '../../containers/users/with-authentication';
import { RedirectToLogin } from '../../routes/login';
import { StoreContext } from '../../contexts/store-context';

@observer
class Reports extends React.Component {
    declare context: React.ContextType<typeof StoreContext>;
    static contextType = StoreContext;

    componentDidMount() {
        this.context
            .reports.reports.fetchAsync();
    }

    componentWillUnmount() {
        this.context
            .reports.reports.dispose();
    }

    registrationClick = (id: string) => {
        goToRegistration(this.context, id);
    }

    goToDate(e: React.MouseEvent, date: Date) {
        e.preventDefault();
        this.context
            .view.track = true;
        goToOverview(this.context
            , {
                year: date.getFullYear(),
                month: date.getMonth() + 1,
                day: date.getDate()
            }, { track: true });
    }

    render() {
        if (!this.context
            .view.moment) return null;

        const totalTime = this.context
            .timesheets.registrationsTotalTime;

        const totalLabel = `Total in ${this.context
            .view.moment.format('MMMM')}`;
        const total = <ListItem key={`total-month`} lines={[totalLabel]} meta={parseFloat(totalTime.toFixed(2)) + " hours"} disabled={true}></ListItem>

        const totalList = <List style={{ width: "100%" }}><ListDivider></ListDivider>{total}<ListDivider></ListDivider></List>;

        const { month, year } = this.context
            .view;

        const download = (this.context
            .reports.report && this.context
                .reports.report.data) ? this.context
                    .reports.reportUrl
                ? <a href={this.context
                    .reports.reportUrl}>Download report</a>
                : this.context
                    .reports.report.data.status : undefined;
        const downloadReport = download &&
            <FlexGroup direction={"vertical"} style={{ paddingRight: "1em", alignItems: "flex-end" }}>{download}</FlexGroup>

        return (
            <>
                <FlexGroup direction="vertical">
                    <FlexGroup style={{ alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                        <DateSelect
                            style={{ margin: "1em" }}
                            onMonthChange={this.changeMonth.bind(this)}
                            onYearChange={this.changeYear.bind(this)}
                            month={month ? month - 1 : undefined}
                            year={year} />
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
        this.context
            .user.userId
            && this.context
                .view.year
            && this.context
                .view.month
            && this.context
                .reports.requestReport(this.context
                    .user.userId, this.context
                        .view.year, this.context
                            .view.month);
    }

    changeMonth(month: number) {
        this.context.view.month = month + 1;
    }

    changeYear(year: number) {
        this.context.view.year = year;
    }
}

export default withAuthentication(
    Reports,
    <RedirectToLogin />,
);
