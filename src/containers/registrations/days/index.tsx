import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { Day as Day } from '../day';
import { useStore } from '../../../contexts/store-context';

export enum SortOrder {
    Ascending = 1,
    Descending = -1
}

export interface IDaysProps {
    registrationClick: (id: string) => void;
    registrationToggleSelect?: (id: string) => void;
    totalOnTop?: boolean;
    sortOrder?: SortOrder
    activeDate?: number;
    isCollapsable?: boolean;
    isMonthView: boolean;
    showHeaderAddButton?: boolean;
}

export const Days = observer((props: IDaysProps) => {
    const store = useStore();

    const {
        sortOrder = SortOrder.Ascending,
        isMonthView,
        showHeaderAddButton = true,
    } = props;

    return <>{(sortOrder > 0
        ? store.timesheets.registrationsGroupedByDay
        : store.timesheets.registrationsGroupedByDayReversed)
        .map((g, i) => {
            const isCollapsed = !store.timesheets.selectedRegistrationDays
                .some(d => d === g.groupKey);

            return <Day
                key={`group-${i}`}
                group={g}
                {...{ ...props, isCollapsed }}
                headerClick={e => {
                    if ((e.target as HTMLElement).closest(".prevent-propagation"))
                        return;

                    store.timesheets.toggleSelectedRegistrationDay(g.groupKey);
                }}
                isMonthView={isMonthView}
                showHeaderAddButton={showHeaderAddButton}
            />
        })}</>;
});