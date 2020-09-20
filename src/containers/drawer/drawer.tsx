import * as React from 'react';
import { Drawer as RMWCDrawer, DrawerHeader, DrawerContent } from '@rmwc/drawer';
import { observer } from 'mobx-react-lite';

import { Menu } from '../ui/menu';
import { ErrorBoundary } from '../../components/error-boundary/error-boundary';
import { AccountBadge } from '../../components/account-badge/account-badge';
import { useUserStore } from '../../contexts/user-context';
import { useViewStore } from '../../contexts/view-context';
import { useRouterStore } from '../../stores/router-store';

import "./drawer.scss";
import { goToUserProfile } from '../../internal';

export const Drawer = observer(() => {
    const user = useUserStore();
    const view = useViewStore();
    const router = useRouterStore();

    const displayName = user.authenticatedUser
        ? user.authenticatedUser.name || "Guest"
        : "";
    const email = user.authenticatedUser
        ? user.authenticatedUser.email || "unknown@timesheets.com"
        : "";

    return (
        <ErrorBoundary>
            <RMWCDrawer dismissible open={user.authenticatedUser && view.isDrawerOpen}>
                <DrawerHeader>
                    <AccountBadge
                        email={email}
                        name={displayName}
                        onClick={() => goToUserProfile(router)}
                    />
                </DrawerHeader>
                <DrawerContent>
                    <Menu />
                </DrawerContent>
            </RMWCDrawer>
        </ErrorBoundary>
    );
});
Drawer.displayName = "Drawer";
