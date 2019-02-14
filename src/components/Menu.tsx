import * as React from 'react';
import { observer } from 'mobx-react';
import { goToOverview, goToLogin, goToSettings, goToReports, goToDashboard } from "../internal";
import { firestorable } from '../Firestorable/Firestorable';
import store from '../stores/RootStore';
import Calendar, { CalendarTileProperties } from 'react-calendar/dist/entry.nostyle';

@observer
export class Menu extends React.Component {

    dateChanged = (dates: Date | Date[]) => {
        const date = dates instanceof(Date) ? dates : dates[0];
        goToOverview(store, { year: date.getFullYear(), day: date.getDate(), month: date.getMonth() + 1 });
    }

    navigateToOverview = (e: React.MouseEvent) => {
        e.preventDefault();
        const date = new Date();
        goToOverview(store, { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear() });
    }

    navigateToCurrentMonth = (e: React.MouseEvent) => {
        e.preventDefault();
        const today = new Date();
        goToOverview(store, { year: today.getFullYear(), month: today.getMonth() + 1 });
    }

    toggleLogin = (e: React.MouseEvent) => {
        e.preventDefault();
        store.user.currentUser ? firestorable.auth.signOut() : goToLogin(store);
    }

    navigate = (e: React.MouseEvent, navigate: () => void) => {
        e.preventDefault();
        navigate();
    }

    getTileClassName = (tile: CalendarTileProperties) => {
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

    render() {
        return (
            <>
                <Calendar key={store.timesheets.registrationsGroupedByDay.toString()} tileClassName={this.getTileClassName} value={store.view.moment.toDate()} onChange={this.dateChanged}></Calendar>
                <div className="mdc-list">
                    <a className="mdc-list-item" onClick={this.navigateToOverview} href="/" aria-selected="true">
                        <i className="material-icons mdc-list-item__graphic" aria-hidden="true">today</i>
                        <span className="mdc-list-item__text">Today</span>
                    </a>

                    <hr className="mdc-list-divider" />

                    <h6 className="mdc-list-group__subheader">Reports</h6>
                    <a className="mdc-list-item" onClick={e => this.navigate(e, () => {e.preventDefault(); goToReports(store);})} href="#">
                        <i className="material-icons mdc-list-item__graphic" aria-hidden="true">list</i>
                        <span className="mdc-list-item__text">Export</span>
                    </a>

                    <a className="mdc-list-item" onClick={e => this.navigate(e, () => {e.preventDefault(); goToDashboard(store);})} href="#">
                        <i className="material-icons mdc-list-item__graphic" aria-hidden="true">bar_chart</i>
                        <span className="mdc-list-item__text">Dashboard</span>
                    </a>

                    <hr className="mdc-list-divider" />

                    <a className="mdc-list-item" onClick={e => this.navigate(e, goToSettings)} href="#">
                        <i className="material-icons mdc-list-item__graphic" aria-hidden="true">settings</i>
                        <span className="mdc-list-item__text">Settings</span>
                    </a>
                    <a className="mdc-list-item" onClick={this.toggleLogin} href="#">
                        <i className="material-icons mdc-list-item__graphic" aria-hidden="true">perm_identity</i>
                        <span className="mdc-list-item__text">{store.user.userId ? "Logout" : "Login"}</span>
                    </a>

                </div>
            </>
        );
    }
}