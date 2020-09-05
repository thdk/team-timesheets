import React from "react";
import { observer } from "mobx-react-lite";
import { ListDivider } from '@rmwc/list';

import { goToRegistration } from '../../internal';
import { TimesheetDays } from '../../containers/timesheet/days';

import { useRouterStore } from "../../stores/router-store";
import { useViewStore } from "../../stores/view-store";
import { useRegistrationStore } from "../../contexts/registration-context";
import { FlexGroup } from "../../components/layout/flex";

import "./registrations.scss";
import { TimesheetDayView } from "./day-view/timesheet-day-view";

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

    if (!view.moment) return null;

    if (view.day) {
        return (
            <TimesheetDayView
                registrationClick={registrationClick}
                registrationToggleSelect={registrationSelect}
            />
        );
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
        </div>

        const sortOrder = timesheets.registrationsGroupedByDaySortOrder;

        return (
            <FlexGroup direction="vertical">
                <div style={{ paddingLeft: "1em" }}>
                    <h3 className="mdc-typography--subtitle1">
                        {`Timesheet ${view.moment.format('MMMM YYYY')}`}
                    </h3>
                </div>
                {totalList}
                <TimesheetDays
                    registrationClick={registrationClick}
                    registrationToggleSelect={registrationSelect}
                    sortOrder={sortOrder}
                    isMonthView={!view.day}
                >
                </TimesheetDays>
            </FlexGroup>
        );
    }
});