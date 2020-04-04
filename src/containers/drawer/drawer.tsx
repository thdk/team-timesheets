import * as React from 'react';
import { Drawer as RMWCDrawer, DrawerHeader, DrawerTitle, DrawerSubtitle, DrawerContent } from '@rmwc/drawer';

import { observer } from 'mobx-react-lite';
import Menu from '../ui/menu';
import { StoreContext } from '../../contexts/store-context';

const Drawer = () => {
    const store = React.useContext(StoreContext);

    const displayName = store.user.authenticatedUser ? store.user.authenticatedUser.name || "Guest" : "";
    return <RMWCDrawer dismissible open={store.view.isDrawerOpen}>
        <DrawerHeader>
            <DrawerTitle>Timesheets</DrawerTitle>
            <DrawerSubtitle>{displayName}</DrawerSubtitle>
        </DrawerHeader>
        <DrawerContent>
            <Menu/>
        </DrawerContent>
    </RMWCDrawer>
};

export default observer(Drawer);
