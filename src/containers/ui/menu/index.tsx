import * as React from 'react';
import { observer } from 'mobx-react';
import { goToOverview, goToSettings, goToReports, goToProjects, goToDashboard, goToLogin } from "../../../internal";
import store from '../../../stores/root-store';
import { canManageProjects } from '../../../rules/rules';
import { IWithAuthenticatedUserProps } from '../../users/with-authenticated-user';
import TimesheetCalendar from '../../timesheet-calendar/timesheet-calendar';
import { withAuthentication } from '../../users/with-authentication';
import { withAuthorisation } from '../../users/with-authorisation';

type Props = Partial<IWithAuthenticatedUserProps>;

@observer
class Menu extends React.Component<Props> {

    navigateToOverview = (e: React.MouseEvent, month = false) => {
        e.preventDefault();
        const date = new Date();
        goToOverview(store, { day: month ? undefined : date.getDate(), month: date.getMonth() + 1, year: date.getFullYear() }, { track: false });
    }

    toggleLogin = (e: React.MouseEvent) => {
        e.preventDefault();
        store.user.authenticatedUser ? store.user.signout() : goToLogin(store);
    }

    navigate = (e: React.MouseEvent, navigate: () => void) => {
        e.preventDefault();
        navigate();
    }

    render() {
        const ProjectsMenuItem = withAuthorisation(() => <>
            <hr className="mdc-list-divider" />

            <a className="mdc-list-item" onClick={e => this.navigate(e, goToProjects)} href="#">
                <i className="material-icons mdc-list-item__graphic" aria-hidden="true">star_border</i>
                <span className="mdc-list-item__text">Projects</span>
            </a>
        </>,
            canManageProjects
        );

        const AuthenticatedMenu = withAuthentication(() =>
            <div className="mdc-list">
                <a className="mdc-list-item" onClick={this.navigateToOverview} href="/" aria-selected="true">
                    <i className="material-icons mdc-list-item__graphic" aria-hidden="true">today</i>
                    <span className="mdc-list-item__text">Today</span>
                </a>

                <a className="mdc-list-item" onClick={e => this.navigateToOverview(e, true)} href="/" aria-selected="true">
                    <i className="material-icons mdc-list-item__graphic" aria-hidden="true">calendar_today</i>
                    <span className="mdc-list-item__text">This month</span>
                </a>

                <hr className="mdc-list-divider" />

                <h6 className="mdc-list-group__subheader">Reports</h6>
                <a className="mdc-list-item" onClick={e => this.navigate(e, () => { e.preventDefault(); goToReports(store); })} href="#">
                    <i className="material-icons mdc-list-item__graphic" aria-hidden="true">list</i>
                    <span className="mdc-list-item__text">Export</span>
                </a>

                <a className="mdc-list-item" onClick={e => this.navigate(e, () => { e.preventDefault(); goToDashboard(store); })} href="#">
                    <i className="material-icons mdc-list-item__graphic" aria-hidden="true">bar_chart</i>
                    <span className="mdc-list-item__text">Dashboard</span>
                </a>

                <ProjectsMenuItem />

                <hr className="mdc-list-divider" />

                <a className="mdc-list-item" onClick={e => this.navigate(e, goToSettings)} href="#">
                    <i className="material-icons mdc-list-item__graphic" aria-hidden="true">settings</i>
                    <span className="mdc-list-item__text">Settings</span>
                </a>

                <hr className="mdc-list-divider" />
            </div>
        );

        return (
            <>
                <TimesheetCalendar />
                <AuthenticatedMenu />

                <div className="mdc-list">
                    <a className="mdc-list-item" onClick={this.toggleLogin} href="#">
                        <i className="material-icons mdc-list-item__graphic" aria-hidden="true">perm_identity</i>
                        <span className="mdc-list-item__text">{store.user.userId ? "Logout" : "Login"}</span>
                    </a>
                </div>
            </>
        );
    }
}

export default Menu;
