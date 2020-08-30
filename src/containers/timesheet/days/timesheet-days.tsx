import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { Day as Day } from '../day';
import { useRegistrationStore } from '../../../contexts/registration-context';
import { ComponentProps } from 'react';

export enum SortOrder {
    Ascending = 1,
    Descending = -1
}

export interface IDaysProps
    extends Pick<ComponentProps<typeof Day>,
    "registrationClick" |
    "registrationToggleSelect" |
    "isMonthView"
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

            return <Day
                key={`group-${i}`}
                group={g}
                isCollapsed={isCollapsed}
                {...dayProps}
                headerClick={e => {
                    if ((e.target as HTMLElement).closest(".prevent-propagation"))
                        return;

                    timesheets.toggleSelectedRegistrationDay(g.groupKey);
                }}
                showHeaderAddButton={showHeaderAddButton}
            />
        })}</>;
});
