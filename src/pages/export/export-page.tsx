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
import { ReportDownload } from '../../containers/report-download';
import { TotalList } from '../../containers/registrations-list-total';

export const Reports = withAuthentication(
    observer(() => {
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
    }),
    <RedirectToLogin />,
);;
