import React from "react";
import { observer } from "mobx-react-lite";

import { goToRegistration } from '../../internal';

import { useRouterStore } from "../../stores/router-store";
import { useViewStore } from "../../stores/view-store";
import { useRegistrationStore } from "../../contexts/registration-context";

import { TimesheetDayView } from "./day-view/timesheet-day-view";
import { TimesheetMonthView } from "./month-view";

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

    if (!view.moment) return null;

    return view.day
        ? (
            <TimesheetDayView
                registrationClick={registrationClick}
                registrationToggleSelect={registrationSelect}
            />
        )
        : (
            <TimesheetMonthView
                registrationClick={registrationClick}
                registrationToggleSelect={registrationSelect}
            />
        );
});