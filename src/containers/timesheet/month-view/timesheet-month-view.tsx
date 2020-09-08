import React, { ComponentProps } from "react";
import { observer } from "mobx-react-lite";
import { useRegistrationStore } from "../../../contexts/registration-context";
import { Day } from "../day";
import { ListDivider } from "@rmwc/list";
import { FlexGroup } from "../../../components/layout/flex";
import { TimesheetDays } from "../days";
import { useViewStore } from "../../../stores/view-store";

export const TimesheetMonthView = observer(({
    registrationClick,
    registrationToggleSelect,
}: Pick<ComponentProps<typeof Day>,
    "registrationClick" |
    "registrationToggleSelect"
>) => {
    const timesheets = useRegistrationStore();
    const view = useViewStore();

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
                registrationToggleSelect={registrationToggleSelect}
                sortOrder={sortOrder}
                isMonthView={!view.day}
            >
            </TimesheetDays>
        </FlexGroup>
    );
});
