import React, { useCallback } from 'react';
import { observer } from "mobx-react-lite";
import { goToRegistration } from '../../internal';
import { Days, SortOrder } from '../../containers/registrations/days';
import { DateSelect } from '../../components/date-select';
import { ButtonType, Button } from '../../mdc/buttons/button';
import { FlexGroup } from '../../components/layout/flex';
import { withAuthentication } from '../../containers/users/with-authentication';
import { RedirectToLogin } from '../../routes/login';
import { useStore } from '../../contexts/store-context';
import { ListItem, List, ListDivider, ListItemText, ListItemMeta } from '@rmwc/list';
import { IReport } from '../../../common';

const ReportDownloadLink = observer(({ report }: { report: IReport }) => {
    const store = useStore();

    return <>
        {
            store.reports.reportUrl
                ? <a href={store.reports.reportUrl}>Download report</a>
                : report.status
        }
    </>;
});

const ReportDownload = observer(() => {
    const store = useStore();
    const report = store.reports.report && store.reports.report.data;

    if (!report) {
        return null;
    }

    return (
        <FlexGroup
            direction={"vertical"}
            style={{ paddingRight: "1em", alignItems: "flex-end" }}
        >
            <ReportDownloadLink report={report} />
        </FlexGroup>
    )
});

const TotalList = observer(() => {
    const store = useStore();

    const totalTime = store.timesheets.registrationsTotalTime;

    const Total = () => (
        <ListItem key={`total-month`} disabled={true}>
            <ListItemText>
                {`Total in ${store.view.moment.format('MMMM')}`}
            </ListItemText>
            <ListItemMeta>
                {parseFloat(totalTime.toFixed(2)) + " hours"}
            </ListItemMeta>
        </ListItem>
    );

    return (
        <List style={{ width: "100%" }}>
            <ListDivider />
            <Total />
            <ListDivider />
        </List>
    )
});

export const Reports = observer(() => {
    const store = useStore();

    const onRegistrationClick = useCallback((id: string) => {
        goToRegistration(store, id);
    }, [goToRegistration, store]);

    const onExportClick = () => {
        store.user.authenticatedUserId
            && store.view.year
            && store.view.month
            && store.reports.requestReport(
                store.user.authenticatedUserId,
                store.view.year,
                store.view.month,
            );
    }

    const onChangeMonthClick = (month: number) => {
        store.view.month = month + 1;
    }

    const onChangeYearClick = (year: number) => {
        store.view.year = year;
    }


    if (!store.view.moment) {
        return null;
    }

    const { month, year } = store.view;

    return (
        <>
            <FlexGroup direction="vertical">
                <FlexGroup style={{ alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <DateSelect
                        style={{ margin: "1em" }}
                        onMonthChange={onChangeMonthClick}
                        onYearChange={onChangeYearClick}
                        month={month ? month - 1 : undefined}
                        year={year} />
                    <Button
                        onClick={onExportClick}
                        style={{ margin: "1em" }}
                        type={ButtonType.Outlined}
                    >
                        Export
                    </Button>
                </FlexGroup>

                <ReportDownload />

                <Days
                    sortOrder={SortOrder.Ascending}
                    totalOnTop={true}
                    registrationClick={onRegistrationClick}
                    isMonthView={true}
                    showHeaderAddButton={false}
                />

                <TotalList />
            </FlexGroup>
        </>
    );
});

export default withAuthentication(
    Reports,
    <RedirectToLogin />,
);
