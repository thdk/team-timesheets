import * as React from 'react';
import { observer } from 'mobx-react';
import { goToOverview, goToSettings, goToReports, goToProjects, goToDashboard, goToLogin, goToFavorites } from "../../../internal";

import { canManageProjects } from '../../../rules/rules';
import { IWithAuthenticatedUserProps } from '../../users/with-authenticated-user';
import TimesheetCalendar from '../../timesheet-calendar/timesheet-calendar';
import { withAuthentication } from '../../users/with-authentication';
import { withAuthorisation } from '../../users/with-authorisation';
import { StoreContext } from '../../../contexts/store-context';

type Props = Partial<IWithAuthenticatedUserProps>;

@observer
class Menu extends React.Component<Props> {
    declare context: React.ContextType<typeof StoreContext>
    static contextType = StoreContext;

    navigateToOverview = (e: React.MouseEvent, month = false) => {
        e.preventDefault();
        const date = new Date();
        goToOverview(this.context, { day: month ? undefined : date.getDate(), month: date.getMonth() + 1, year: date.getFullYear() }, { track: false });
    }

    toggleLogin = (e: React.MouseEvent) => {
        e.preventDefault();
        this.context.user.authenticatedUser ? this.context.user.signout() : goToLogin(this.context);
    }

    navigate = (e: React.MouseEvent, navigate: () => void) => {
        e.preventDefault();
        navigate();
    }

    render() {
        const ProjectsMenuItem = withAuthorisation(() => <>
            <hr className="mdc-list-divider" />

            <a className="mdc-list-item" onClick={e => this.navigate(e, goToProjects.bind(this, this.context))} href="#">
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

                <a className="mdc-list-item" onClick={e => this.navigate(e, () => { e.preventDefault(); goToFavorites(this.context); })} href="#">
                    <i className="material-icons mdc-list-item__graphic" aria-hidden="true">favorite</i>
                    <span className="mdc-list-item__text">Favorites</span>
                </a>

                <hr className="mdc-list-divider" />

                <h6 className="mdc-list-group__subheader">Reports</h6>
                <a className="mdc-list-item" onClick={e => this.navigate(e, () => { e.preventDefault(); goToReports(this.context); })} href="#">
                    <i className="material-icons mdc-list-item__graphic" aria-hidden="true">list</i>
                    <span className="mdc-list-item__text">Export</span>
                </a>

                <a className="mdc-list-item" onClick={e => this.navigate(e, () => { e.preventDefault(); goToDashboard(this.context); })} href="#">
                    <i className="material-icons mdc-list-item__graphic" aria-hidden="true">bar_chart</i>
                    <span className="mdc-list-item__text">Dashboard</span>
                </a>

                <ProjectsMenuItem />

                <hr className="mdc-list-divider" />

                <a className="mdc-list-item" onClick={e => this.navigate(e, goToSettings.bind(this, this.context))} href="#">
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
                        <span className="mdc-list-item__text">{this.context.user.userId ? "Logout" : "Login"}</span>
                    </a>
                </div>
            </>
        );
    }
}

export default Menu;
