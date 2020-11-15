import React from 'react';
import { Drawer as RMWCDrawer, DrawerHeader, DrawerContent } from '@rmwc/drawer';
import { observer } from 'mobx-react-lite';

import { useViewStore } from '../../contexts/view-context';
import { Menu } from '../ui/menu';
import { DivisionUsersMenu } from '../division-users/menu';

import "./drawer.scss";

export const Drawer = observer(() => {
    const view = useViewStore();

    return (
        <RMWCDrawer dismissible open={view.isDrawerOpen}>
            <DrawerHeader>
                <DivisionUsersMenu />
            </DrawerHeader>
            <DrawerContent>
                <Menu />
            </DrawerContent>
        </RMWCDrawer>
    );
});
Drawer.displayName = "Drawer";
