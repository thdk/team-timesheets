import { observer } from 'mobx-react-lite';
import * as React from 'react';
import Calendar, { CalendarTileProperties } from 'react-calendar/dist/entry.nostyle';

import store from '../../stores/root-store';
import { goToOverview } from '../../internal';
import { withAuthentication } from '../users/with-authentication';

const TimesheetCalendar = observer(() => {

    const dateChanged = React.useCallback((dates: Date | Date[]) => {
        const date = dates instanceof (Date) ? dates : dates[0];
        goToOverview(store, { year: date.getFullYear(), day: date.getDate(), month: date.getMonth() + 1 }, { track: false });
    }, []);

    const getTileClassName = (tile: CalendarTileProperties) => {
        const classNames = [];
        if (tile.view === "month") {
            // TODO: TIMEZONE ISSUE!!!
            // It should be enough to check g.date.getTime() === tile.date.getTime()
            // However due to a timezone issue it not always gives the required results!
            // below code is NOT ready for production
            const tileHasData = store.timesheets.registrationsGroupedByDay.some(g =>
                g.groupKey.getDate() === tile.date.getDate()
                && g.groupKey.getMonth() === tile.date.getMonth()
                && g.groupKey.getFullYear() === tile.date.getFullYear());
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
