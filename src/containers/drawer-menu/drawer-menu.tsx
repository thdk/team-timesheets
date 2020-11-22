import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { List } from '@rmwc/list';

import { goToOverview, goToSettings, goToReports, goToProjects, goToDashboard, goToFavorites } from "../../internal";

import { withAuthorisation } from '../users/with-authorisation';
import { useViewStore } from '../../contexts/view-context';
import { useRouterStore } from '../../stores/router-store';
import { canAddRegistrations } from '../../rules';
import { withAuthentication } from '../users/with-authentication';
import { DrawerMenuGroup } from '../drawer-menu-group';
import { TimesheetCalendar } from '../timesheet-calendar';

const TimesheetMenu = withAuthorisation(
    observer(() => {
        const view = useViewStore();
        const router = useRouterStore();

        const navigateToOverview = (month = false) => {
            const date = new Date();
            goToOverview({
                router,
                view,
            }, { day: month ? undefined : date.getDate(), month: date.getMonth() + 1, year: date.getFullYear() }, { track: false });
        }

        return (
            <DrawerMenuGroup
                items={
                    [
                        {
                            action: navigateToOverview,
                            text: "Today",
                            icon: "today",
                        },
                        {
                            action: navigateToOverview.bind(null, true),
                            text: "This month",
                            icon: "calendar_today",
                        },
                        {
                            action: () => goToFavorites(router),
                            text: "Favorites",
                            icon: "favorite",
                        }
                    ]
                }
            />
        );
    }),
    user => canAddRegistrations(user),
);

const ReportMenu = withAuthorisation(
    () => {
        const view = useViewStore();
        const router = useRouterStore();

        return (
            <DrawerMenuGroup
                items={
                    [
                        {
                            action: () => goToReports({ router, view }),
                            text: "Export",
                            icon: "list",
                        },
                        {
                            action: () => goToDashboard(router),
                            text: "Dashboard",
                            icon: "bar_chart",
                        },
                    ]
                }
            />
        );
    },
    canAddRegistrations,
);

const AdminMenu = withAuthorisation(
    () => {
        const router = useRouterStore();

        return (
            <DrawerMenuGroup
                items={
                    [
                        {
                            action: () => goToProjects(router),
                            text: "Projects",
                            icon: "star_border",
                        },
                        {
                            action: () => goToSettings(router),
                            text: "Settings",
                            icon: "settings",
                        },
                    ]
                }
            />
        );
    },
    user => !!(user.roles.admin || user.roles.editor),
);

const AuthenticatedMenu = withAuthentication(
    ({
        onAction,
    }: {
        onAction?(): void;
    }) => {
        return (
            <>
                <TimesheetCalendar 
                    onAction={onAction}
                />
                <List
                    onAction={onAction}
                >
                    <TimesheetMenu />
                    <ReportMenu />
                    <AdminMenu />
                </List>
            </>
        );
    },
);

const WelcomeRecruit = withAuthorisation(
    () => <div
        style={{
            padding: "1em",
        }}
    >
        <h3>Welcome recruit!</h3>
        <p>You need to be in a division to start.</p>
        <br />

        <p>For info or help with setup, feel free send me an email:
            <br /><br />
            <a href="mailto:t.dekiere@gmail.com">
                <span> t.dekiere@gmail.com</span>
            </a>
        </p>
    </div>,
    user => !canAddRegistrations(user)
);

export const DrawerMenu = (
    {
        onAction,
    }: {
        onAction?(): void;
    }
) => {
    return (
        <>
            <AuthenticatedMenu
                onAction={onAction}
            />
            <WelcomeRecruit />
        </>
    );
};
DrawerMenu.displayName = "DrawerMenu";
