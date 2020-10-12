import React from 'react';
import { Drawer as RMWCDrawer, DrawerHeader, DrawerContent } from '@rmwc/drawer';
import { observer } from 'mobx-react-lite';

import { ErrorBoundary } from '../../components/error-boundary/error-boundary';
import { useUserStore } from '../../contexts/user-context';
import { useViewStore } from '../../contexts/view-context';
import { Menu } from '../ui/menu';
import { DivisionUsersMenu } from '../division-users/menu';

import "./drawer.scss";

export const Drawer = observer(() => {
    const user = useUserStore();
    const view = useViewStore();

    return (
        <ErrorBoundary>
            <RMWCDrawer dismissible open={user.divisionUser && view.isDrawerOpen}>
                <DrawerHeader>
                    <DivisionUsersMenu />
                </DrawerHeader>
                <DrawerContent>
                    <Menu />
                </DrawerContent>
            </RMWCDrawer>
        </ErrorBoundary >
    );
});
Drawer.displayName = "Drawer";
