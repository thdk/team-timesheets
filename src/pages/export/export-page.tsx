import React, { useCallback } from 'react';
import { observer } from "mobx-react-lite";
import { goToRegistration } from '../../internal';
import { TimesheetDays, SortOrder } from '../../containers/timesheet/days';
import { DateSelect } from '../../components/date-select';
import { FlexGroup } from '../../components/layout/flex';
import { withAuthentication } from '../../containers/users/with-authentication';
import { RedirectToLogin } from '../../routes/login';
import { RegistrationsListTotal } from '../../containers/registrations-list-total';
import { ReportDownloadLink } from '../../containers/report-download-link';
import { useViewStore } from '../../stores/view-store';
import { useUserStore } from "../../contexts/user-context";
import { useReportStore } from '../../stores/report-store';
import { useRouterStore } from '../../stores/router-store';
import { Button } from '@rmwc/button';

export const ExportPage = withAuthentication(
    observer(() => {
        const user = useUserStore();
        const view = useViewStore();
        const reports = useReportStore();
        const router = useRouterStore();

        const onRegistrationClick = useCallback((id: string) => {
            goToRegistration(router, id);
        }, [goToRegistration, router]);

        const onExportClick = () => {
            user.authenticatedUserId
                && view.year
                && view.month
                && reports.requestReport(
                    user.authenticatedUserId,
                    view.year,
                    view.month,
                );
        }

        const onChangeMonthClick = (month: number) => {
            view.month = month + 1;
        }

        const onChangeYearClick = (year: number) => {
            view.year = year;
        }

        if (!view.moment) {
            return null;
        }

        const { month, year } = view;

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
                            outlined
                        >
                            Export
                        </Button>
                    </FlexGroup>

                    <FlexGroup
                        direction={"vertical"}
                        style={{ paddingRight: "1em", alignItems: "flex-end" }}
                    >
                        <ReportDownloadLink />
                    </FlexGroup>

                    <TimesheetDays
                        sortOrder={SortOrder.Ascending}
                        registrationClick={onRegistrationClick}
                        isMonthView={true}
                        showHeaderAddButton={false}
                    />

                    <RegistrationsListTotal />
                </FlexGroup>
            </>
        );
    }),
    <RedirectToLogin />,
);;
