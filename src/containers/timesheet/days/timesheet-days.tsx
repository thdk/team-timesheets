import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { Day } from '../day';
import { useRegistrationStore } from '../../../contexts/registration-context';
import { ComponentProps } from 'react';
import { GroupedRegistrationHeader } from '../day-header';

export enum SortOrder {
    Ascending = 1,
    Descending = -1
}

export interface IDaysProps
    extends Pick<ComponentProps<typeof Day>,
    "registrationClick" |
    "registrationToggleSelect"
    > {
    sortOrder?: SortOrder
    showHeaderAddButton?: boolean;
}

export const TimesheetDays = observer((props: IDaysProps) => {
    const timesheets = useRegistrationStore();

    const {
        sortOrder = SortOrder.Ascending,
        showHeaderAddButton = true,
        ...dayProps
    } = props;

    return <>{(sortOrder > 0
        ? timesheets.registrationsGroupedByDay
        : timesheets.registrationsGroupedByDayReversed)
        .map((g, i) => {
            const isCollapsed = !timesheets.selectedRegistrationDays
                .some(d => d === g.groupKey);
            return <React.Fragment key={g.groupKey}>
                <GroupedRegistrationHeader
                    groupKey={g.groupKey}
                    totalTime={g.totalTime}
                    isCollapsed={g.isCollapsed}
                    isMonthView
                    isCollapsable
                    headerClick={e => {
                        if ((e.target as HTMLElement).closest(".prevent-propagation"))
                            return;

                        timesheets.toggleSelectedRegistrationDay(g.groupKey);
                    }}
                    showAddButton={showHeaderAddButton}
                />
                <Day
                    key={`group-${i}`}
                    group={g}
                    isCollapsed={isCollapsed}
                    {...dayProps}

                />
            </React.Fragment>
        })}</>;
});
