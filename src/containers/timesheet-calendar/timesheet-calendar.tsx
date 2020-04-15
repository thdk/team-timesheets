import { observer } from 'mobx-react-lite';
import * as React from 'react';
import Calendar, { CalendarTileProperties } from 'react-calendar/dist/entry.nostyle';

import { goToOverview } from '../../internal';
import { withAuthentication } from '../users/with-authentication';
import { useStore } from '../../contexts/store-context';

const TimesheetCalendar = observer(() => {
    const store = useStore();

    const dateChanged = React.useCallback((dates: Date | Date[]) => {
        const date = dates instanceof (Date) ? dates : dates[0];
        goToOverview(store, { year: date.getFullYear(), day: date.getDate(), month: date.getMonth() + 1 }, { track: false });
    }, []);

    const getTileClassName = (tile: CalendarTileProperties) => {
        const classNames = [];
        if (tile.view === "month") {
            const tileHasData = store.timesheets.registrationsGroupedByDay
                .some(g => g.groupKey === tile.date.toDateString());
            if (tileHasData) classNames.push("has-data");
        }

        return classNames.length ? classNames.join(" ") : null;
    }

    return <Calendar
        key={store.timesheets.registrationsGroupedByDay.toString()}
        tileClassName={getTileClassName}
        value={store.view.moment.toDate()}
        onChange={dateChanged} />;
});

export default withAuthentication(
    TimesheetCalendar
);
