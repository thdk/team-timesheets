import React, { ComponentProps } from "react";
import { observer } from "mobx-react-lite";
import { useRegistrationStore } from "../../../contexts/registration-context";
import { Day } from "../day";
import { ListDivider } from "@rmwc/list";
import { FlexGroup } from "../../../components/layout/flex";
import { TimesheetDays } from "../days";
import { useViewStore } from "../../../contexts/view-context";
import { TimesheetDefaults } from "../../timesheet-defaults";

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

    const sortOrder = timesheets.registrationsGroupedByDaySortOrder;

    return (
        <FlexGroup column>
            <div style={{ paddingLeft: "1em" }}>
                <h3 className="mdc-typography--subtitle1">
                    {`Timesheet ${view.moment.format('MMMM YYYY')}`}
                </h3>
            </div>

            <div className="timesheets-header">
                <FlexGroup
                    style={{
                        justifyContent: "space-between"
                    }}>
                    <div
                        className="timesheets-header-label"
                        style={{
                            display: "flex",
                            alignSelf: "flex-end",
                            paddingBottom: "1em",
                        }}
                        key={`total-month`}>
                        {totalLabel}
                    </div>
                    <TimesheetDefaults />

                </FlexGroup>
                <ListDivider />
            </div>
            <TimesheetDays
                registrationClick={registrationClick}
                registrationToggleSelect={registrationToggleSelect}
                sortOrder={sortOrder}
            />
        </FlexGroup>
    );
});
