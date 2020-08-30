import React from "react";
import { observer } from "mobx-react-lite";
import { ListDivider } from '@rmwc/list';

import { goToRegistration, goToOverview } from '../../internal';
import { Day } from '../../containers/timesheet/day';
import { TimesheetDays } from '../../containers/timesheet/days';

import { useRouterStore } from "../../stores/router-store";
import { useViewStore } from "../../stores/view-store";
import { useRegistrationStore } from "../../contexts/registration-context";
import { FlexGroup } from "../../components/layout/flex";

import "./registrations.scss";

export const Timesheet = observer(() => {
    const router = useRouterStore();
    const view = useViewStore();
    const timesheets = useRegistrationStore();

    const registrationClick = (id: string) => {
        if (view.selection.size) {
            view.toggleSelection(id);
        } else {
            timesheets.setSelectedRegistration(id);
            goToRegistration(router, id);
        }
    }

    const registrationSelect = (id: string) => {
        view.toggleSelection(id);
    }

    const goToMonth = (e: React.MouseEvent) => {
        e.preventDefault();
        goToOverview({ view, router }, {
            year: view.year!,
            month: view.month!
        }, { track: false, currentDate: view.track ? view.day! : undefined });
    }


    if (!view.moment) return null;

    let regs: React.ReactNode;

    if (view.day) {
        const group = timesheets.registrationsGroupedByDay.filter(g => g.groupKey === view.moment.toDate().toDateString());

        regs = <Day
            group={group[0] || { groupKey: view.moment.toDate().toDateString(), totalTime: 0, registrations: [] }}
            registrationClick={registrationClick}
            registrationToggleSelect={registrationSelect}
            isCollapsed={false}
            headerClick={() => { }}
        />;
    } else {
        const totalTime = timesheets.registrationsTotalTime;

        const totalLabel = `Total time: ${parseFloat(totalTime.toFixed(2))} hours`;
        const total = <div
            className="timesheets-header-label"
            key={`total-month`}>
            {totalLabel}
        </div>
        const totalList = <div className="timesheets-header">
            {total}
            <ListDivider></ListDivider>
        </div>;

        const sortOrder = timesheets.registrationsGroupedByDaySortOrder;

        regs = <>
            {totalList}
            <TimesheetDays
                totalOnTop={true}
                registrationClick={registrationClick}
                registrationToggleSelect={registrationSelect}
                sortOrder={sortOrder}
                isMonthView={!view.day}
            >
            </TimesheetDays>
        </>;
    }


    const title = view.day
        ? <>Timesheet <a href="#" onClick={goToMonth}>{view.moment.format('MMMM')}</a> {view.moment.format('D, YYYY')}</>
        : `Timesheet ${view.moment.format('MMMM YYYY')}`;
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
        </>
    );
});