import * as React from 'react';
import { DatetimePicker } from 'rc-datetime-picker';
import store from '../store';
import moment from 'moment-es6';
import { observer } from 'mobx-react';
import { goTo as goToOverview, goToProjects, goToLogin } from "../internal";

@observer
export class Menu extends React.Component {

    dateChanged = (moment: moment.Moment) => {
        goToOverview(store, { year: moment.year(), day: moment.date(), month: moment.month() + 1 });
    }

    navigateToProjects = (e: React.MouseEvent) => {
        e.preventDefault();
        goToProjects(store);
    }

    navigateToOverview = (e: React.MouseEvent) => {
        e.preventDefault();
        const date = new Date();
        goToOverview(store, { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear() });
    }

    navigateToLogin = (e:React.MouseEvent) => {
        e.preventDefault();
        goToLogin(store);
    }

    render() {
        return (
            <>
                <DatetimePicker moment={moment(store.view.moment)} showTimePicker={false} onChange={this.dateChanged}></DatetimePicker>
                <div className="mdc-list">
                    <a className="mdc-list-item" onClick={this.navigateToOverview} href="/" aria-selected="true">
                        <i className="material-icons mdc-list-item__graphic" aria-hidden="true">today</i>
                        <span className="mdc-list-item__text">Today</span>
                    </a>

                    <hr className="mdc-list-divider" />
                    <h6 className="mdc-list-group__subheader">Planning</h6>
                    <a className="mdc-list-item" onClick={this.navigateToProjects} href="/config/projects">
                        <i className="material-icons mdc-list-item__graphic" aria-hidden="true">bookmark</i>
                        <span className="mdc-list-item__text">Projects</span>
                    </a>

                    <hr className="mdc-list-divider" />
                    <a className="mdc-list-item" onClick={this.navigateToLogin} href="/config/projects">
                        <i className="material-icons mdc-list-item__graphic" aria-hidden="true">perm_identity</i>
                        <span className="mdc-list-item__text">Login</span>
                    </a>

                </div>
            </>
        );
    }
}