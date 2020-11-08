import * as React from 'react';
import { observer } from 'mobx-react-lite';

import { goToOverview, goToSettings, goToReports, goToProjects, goToDashboard, goToFavorites } from "../../../internal";

import { canManageProjects } from '../../../rules';
import TimesheetCalendar from '../../timesheet-calendar/timesheet-calendar';
import { withAuthentication } from '../../users/with-authentication';
import { withAuthorisation } from '../../users/with-authorisation';
import { useViewStore } from '../../../contexts/view-context';
import { useRouterStore } from '../../../stores/router-store';

export const Menu = observer(() => {
    const view = useViewStore();
    const router = useRouterStore();

    const navigateToOverview = (e: React.MouseEvent, month = false) => {
        e.preventDefault();
        const date = new Date();
        goToOverview({
            router,
            view,
        }, { day: month ? undefined : date.getDate(), month: date.getMonth() + 1, year: date.getFullYear() }, { track: false });
    }

    const navigate = (e: React.MouseEvent, navigate: () => void) => {
        e.preventDefault();
        navigate();
    }

    const ProjectsMenuItem = withAuthorisation(() => <>
        <hr className="mdc-list-divider" />

        <a className="mdc-list-item" onClick={e => navigate(e, () => goToProjects(router))} href="#">
            <i className="material-icons mdc-list-item__graphic" aria-hidden="true">star_border</i>
            <span className="mdc-list-item__text">Projects</span>
        </a>
    </>,
        canManageProjects
    );

    const AuthenticatedMenu = withAuthentication(() =>
        <div className="mdc-list">
            <a className="mdc-list-item" onClick={navigateToOverview} href="/" aria-selected="true">
                <i className="material-icons mdc-list-item__graphic" aria-hidden="true">today</i>
                <span className="mdc-list-item__text">Today</span>
            </a>

            <a className="mdc-list-item" onClick={e => navigateToOverview(e, true)} href="/" aria-selected="true">
                <i className="material-icons mdc-list-item__graphic" aria-hidden="true">calendar_today</i>
                <span className="mdc-list-item__text">This month</span>
            </a>

            <a className="mdc-list-item" onClick={e => navigate(e, () => { e.preventDefault(); goToFavorites(router); })} href="#">
                <i className="material-icons mdc-list-item__graphic" aria-hidden="true">favorite</i>
                <span className="mdc-list-item__text">Favorites</span>
            </a>

            <hr className="mdc-list-divider" />

            <h6 className="mdc-list-group__subheader">Reports</h6>
            <a className="mdc-list-item" onClick={e => navigate(e, () => { e.preventDefault(); goToReports({ router, view }); })} href="#">
                <i className="material-icons mdc-list-item__graphic" aria-hidden="true">list</i>
                <span className="mdc-list-item__text">Export</span>
            </a>

            <a className="mdc-list-item" onClick={e => navigate(e, () => { e.preventDefault(); goToDashboard(router); })} href="#">
                <i className="material-icons mdc-list-item__graphic" aria-hidden="true">bar_chart</i>
                <span className="mdc-list-item__text">Dashboard</span>
            </a>

            <ProjectsMenuItem />

            <hr className="mdc-list-divider" />

            <a className="mdc-list-item" onClick={e => navigate(e, () => goToSettings(router))} href="#">
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
        </>
    );
});
Menu.displayName = "Menu";
