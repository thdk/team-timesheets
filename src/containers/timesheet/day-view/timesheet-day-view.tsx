import React, { ComponentProps } from "react";
import { goToOverview } from '../../../internal';
import { useRouterStore } from "../../../stores/router-store";
import { useViewStore } from "../../../contexts/view-context";
import { FlexGroup } from "../../../components/layout/flex";
import { Day } from "../day";
import { useRegistrationStore } from "../../../contexts/registration-context";
import { observer } from "mobx-react-lite";
import { RegistrationSuggestions } from "../../registration-suggestions";

export const TimesheetDayView = observer(({
    registrationClick,
    registrationToggleSelect,
}: Pick<ComponentProps<typeof Day>,
    "registrationClick" |
    "registrationToggleSelect"
>) => {
    const router = useRouterStore();
    const view = useViewStore();
    const timesheets = useRegistrationStore();

    const goToMonth = (e: React.MouseEvent) => {
        e.preventDefault();
        goToOverview({ view, router }, {
            year: view.year!,
            month: view.month!
        }, { track: false, currentDate: view.track ? view.day! : undefined });
    }

    const groups = timesheets.registrationsGroupedByDay.filter(g => g.groupKey === view.moment.toDate().toDateString());
    const group = groups[0] ||
    {
        groupKey: view.moment.toDate().toDateString(),
        totalTime: 0,
        registrations: [],
    };

    return (
        <>
            <FlexGroup direction="vertical">
                <div style={{ paddingLeft: "1em" }}>
                    <h3 className="mdc-typography--subtitle1">
                        Timesheet <a href="#" onClick={goToMonth}>{view.moment.format('MMMM')}</a> {view.moment.format('D, YYYY')}
                    </h3>
                </div>


                <Day
                    group={group}
                    registrationClick={registrationClick}
                    registrationToggleSelect={registrationToggleSelect}
                    isCollapsed={false}
                    headerClick={() => { }}
                />
            </FlexGroup>
            <FlexGroup direction="vertical">
                <RegistrationSuggestions
                    excludedIds={group.registrations
                        .reduce((p, c) => {
                            if (c.data?.sourceId) {
                                p.push(c.data.sourceId)
                            }
                            return p;
                        }, [] as string[])
                    }
                />
            </FlexGroup>
        </>
    );
});
