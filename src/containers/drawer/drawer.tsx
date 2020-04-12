import * as React from 'react';
import { Drawer as RMWCDrawer, DrawerHeader, DrawerTitle, DrawerSubtitle, DrawerContent } from '@rmwc/drawer';

import { observer } from 'mobx-react-lite';
import Menu from '../ui/menu';
import { useStore } from '../../contexts/store-context';
import { ErrorBoundary } from '../../components/error-boundary/error-boundary';

const Drawer = () => {
    const store = useStore();

    const displayName = store.user.authenticatedUser ? store.user.authenticatedUser.name || "Guest" : "";
    return (
        <ErrorBoundary>
            <RMWCDrawer dismissible open={store.view.isDrawerOpen}>
                <DrawerHeader>
                    <DrawerTitle>Timesheets</DrawerTitle>
                    <DrawerSubtitle>{displayName}</DrawerSubtitle>
                </DrawerHeader>
                <DrawerContent>
                    <Menu />
                </DrawerContent>
            </RMWCDrawer>
        </ErrorBoundary>
    );
};

export default observer(Drawer);
