import * as React from 'react';
import moment from 'moment-es6';
import { observer } from 'mobx-react';
import { goToOverview, goToProjects, goToLogin, goToTasks, goToPreferences } from "../internal";
import { firestorable } from '../Firestorable/Firestorable';
import store from '../stores/RootStore';
import { Doc } from '../Firestorable/Document';
import Calendar, { CalendarTileProperties } from 'react-calendar/dist/entry.nostyle';

@observer
export class Menu extends React.Component {

    dateChanged = (dates: Date | Date[]) => {
        const date = dates instanceof(Date) ? dates : dates[0];
        goToOverview(store, { year: date.getFullYear(), day: date.getDate(), month: date.getMonth() + 1 });
    }

    navigateToProjects = (e: React.MouseEvent) => {
        e.preventDefault();
        goToProjects(store);
    }

    navigateToTasks = (e: React.MouseEvent) => {
        e.preventDefault();
        goToTasks(store);
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
        (store.user.user instanceof (Doc)) ? firestorable.auth.signOut() : goToLogin(store);
    }

    navigate = (e: React.MouseEvent, navigate: () => void) => {
        e.preventDefault();
        navigate();
    }

    getTileClassName = (tile: CalendarTileProperties) => {
        if (tile.view === "month") {
            const tileHasData = store.timesheets.registrationsGroupedByDay.some(g =>
                g.date.getDate() === tile.date.getDate()
                && g.date.getMonth() === tile.date.getMonth()
                && g.date.getFullYear() === tile.date.getFullYear());
            if (tileHasData) return "has-data";
        }

        return null;
    }

    render() {
        return (
            <>
                <Calendar key={store.timesheets.registrationsGroupedByDay.map(g => g.date.getDate()).join()} tileClassName={this.getTileClassName} activeStartDate={store.view.moment.toDate()} onChange={this.dateChanged}></Calendar>
                <div className="mdc-list">
                    <a className="mdc-list-item" onClick={this.navigateToOverview} href="/" aria-selected="true">
                        <i className="material-icons mdc-list-item__graphic" aria-hidden="true">today</i>
                        <span className="mdc-list-item__text">Today</span>
                    </a>

                    <a className="mdc-list-item" onClick={this.navigateToCurrentMonth} href="/" aria-selected="true">
                        <i className="material-icons mdc-list-item__graphic" aria-hidden="true">calendar_today</i>
                        <span className="mdc-list-item__text">{moment(new Date()).format("MMMM")}</span>
                    </a>

                    <hr className="mdc-list-divider" />
                    <h6 className="mdc-list-group__subheader">Planning</h6>
                    <a className="mdc-list-item" onClick={this.navigateToProjects} href="/config/projects">
                        <i className="material-icons mdc-list-item__graphic" aria-hidden="true">bookmark</i>
                        <span className="mdc-list-item__text">Projects</span>
                    </a>
                    <a className="mdc-list-item" onClick={this.navigateToTasks} href="/config/tasks">
                        <i className="material-icons mdc-list-item__graphic" aria-hidden="true">bookmark</i>
                        <span className="mdc-list-item__text">Tasks</span>
                    </a>

                    <hr className="mdc-list-divider" />
                    <a className="mdc-list-item" onClick={e => this.navigate(e, goToPreferences)} href="/settings/preferences">
                        <i className="material-icons mdc-list-item__graphic" aria-hidden="true">settings</i>
                        <span className="mdc-list-item__text">Settings</span>
                    </a>
                    <a className="mdc-list-item" onClick={this.toggleLogin} href="/config/projects">
                        <i className="material-icons mdc-list-item__graphic" aria-hidden="true">perm_identity</i>
                        <span className="mdc-list-item__text">{(store.user.user instanceof (Doc)) ? "Logout" : "Login"}</span>
                    </a>

                </div>
            </>
        );
    }
}