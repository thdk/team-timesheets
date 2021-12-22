import { observer } from 'mobx-react-lite';
import * as React from 'react';
import Calendar, { CalendarTileProperties } from 'react-calendar/dist/entry.nostyle';

import { goToOverview } from '../../internal';
import { useRegistrationStore } from '../../contexts/registration-context';
import { useViewStore } from '../../contexts/view-context';
import { useRouterStore } from '../../stores/router-store';
import { withAuthorisation } from '../users/with-authorisation';
import { canAddRegistrations } from '../../rules';

export const TimesheetCalendar = withAuthorisation(
    observer(({
        onAction,
    }: {
        onAction?(): void;
    }) => {
        const timesheets = useRegistrationStore();
        const router = useRouterStore();
        const view = useViewStore();

        const dateChanged = React.useCallback((dates: Date | Date[]) => {
            const date = dates instanceof (Date) ? dates : dates[0];
            goToOverview({ router, view }, { year: date.getFullYear(), day: date.getDate(), month: date.getMonth() + 1 }, { track: false });
            if (onAction) {
                onAction();
            }
        }, [onAction, goToOverview]);

        const getTileClassName = (tile: CalendarTileProperties) => {
            const classNames = [];
            if (tile.view === "month") {
                const tileHasData = timesheets.registrationsGroupedByDay
                    .some(g => g.groupKey === tile.date.toDateString());
                if (tileHasData) classNames.push("has-data");
            }

            return classNames.length ? classNames.join(" ") : null;
        }

        return <Calendar
            tileClassName={getTileClassName}
            value={view.moment.toDate()}
            onChange={dateChanged} />;
    }),
    canAddRegistrations,
);
