import * as React from 'react';
import { observer } from 'mobx-react-lite';

import { goToOverview, goToSettings, goToReports, goToProjects, goToDashboard, goToFavorites } from "../../../internal";

import TimesheetCalendar from '../../timesheet-calendar/timesheet-calendar';
import { withAuthentication } from '../../users/with-authentication';
import { withAuthorisation } from '../../users/with-authorisation';
import { useViewStore } from '../../../contexts/view-context';
import { useRouterStore } from '../../../stores/router-store';
import { canAddRegistrations } from '../../../rules';

const navigate = (e: React.MouseEvent, navigate: () => void) => {
    e.preventDefault();
    navigate();
}

const TimesheetMenu = withAuthorisation(
    observer(() => {
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

        return (
            <>
                <a className="mdc-list-item" onClick={navigateToOverview} href="/" aria-selected="true">
                    <i className="material-icons mdc-list-item__graphic" aria-hidden="true">today</i>
                    <span className="mdc-list-item__text">Today</span>
                </a>

                <a className="mdc-list-item" onClick={e => navigateToOverview(e, true)} href="/" aria-selected="true">
                    <i className="material-icons mdc-list-item__graphic" aria-hidden="true">calendar_today</i>
                    <span className="mdc-list-item__text">This month</span>
                </a>

                <a className="mdc-list-item" onClick={e => navigate(e, () => goToFavorites(router))} href="#">
                    <i className="material-icons mdc-list-item__graphic" aria-hidden="true">favorite</i>
                    <span className="mdc-list-item__text">Favorites</span>
                </a>

                <hr className="mdc-list-divider" />
            </>
        );
    }),
    user => canAddRegistrations(user),
);

const ReportMenu = withAuthorisation(
    () => {
        const view = useViewStore();
        const router = useRouterStore();
        return (
            <>
                <a className="mdc-list-item" onClick={e => navigate(e, () => { e.preventDefault(); goToReports({ router, view }); })} href="#">
                    <i className="material-icons mdc-list-item__graphic" aria-hidden="true">list</i>
                    <span className="mdc-list-item__text">Export</span>
                </a>

                <a className="mdc-list-item" onClick={e => navigate(e, () => { e.preventDefault(); goToDashboard(router); })} href="#">
                    <i className="material-icons mdc-list-item__graphic" aria-hidden="true">bar_chart</i>
                    <span className="mdc-list-item__text">Dashboard</span>
                </a>
            </>
        );
    },
    canAddRegistrations,
);

const AdminMenu = withAuthorisation(
    () => {
        const router = useRouterStore();
        return (
            <>
                <hr className="mdc-list-divider" />

                <a className="mdc-list-item" onClick={e => navigate(e, () => goToProjects(router))} href="#">
                    <i className="material-icons mdc-list-item__graphic" aria-hidden="true">star_border</i>
                    <span className="mdc-list-item__text">Projects</span>
                </a>

                <a className="mdc-list-item" onClick={e => navigate(e, () => goToSettings(router))} href="#">
                    <i className="material-icons mdc-list-item__graphic" aria-hidden="true">settings</i>
                    <span className="mdc-list-item__text">Settings</span>
                </a>

                <hr className="mdc-list-divider" />
            </>
        );
    },
    user => !!(user.roles.admin || user.roles.editor),
);

const AuthenticatedMenu = withAuthentication(
    () => {
        return (
            <>
                <TimesheetCalendar />
                <div className="mdc-list">
                    <TimesheetMenu />

                    <ReportMenu />

                    <AdminMenu />
                </div>
            </>
        );
    },
);

export const Menu = () => {
    return (
        <>
            <AuthenticatedMenu />
        </>
    );
};
Menu.displayName = "Menu";
