import React, { useEffect } from 'react';
import { Drawer as RMWCDrawer, DrawerHeader, DrawerContent } from '@rmwc/drawer';
import { observer } from 'mobx-react-lite';

import { useViewStore } from '../../contexts/view-context';
import { DivisionUsersMenu } from '../division-users/menu';

import "./drawer.scss";
import { useWindowSize } from 'react-use';
import { useCallback } from 'react';
import { DrawerMenu } from '../drawer-menu';
import { useState } from 'react';

const useMobileSize = () => {
    const { width } = useWindowSize(window.innerWidth);
    const [mobile, setMobile] = useState(width < 600);

    useEffect(
        () => {
            const newMobile = width < 600;

            if (newMobile !== mobile) {
                setMobile(newMobile);
            }
        },
        [width, mobile],
    );

    return mobile;
};

export const Drawer = observer(
    () => {
        const view = useViewStore();

        const mobile = useMobileSize();

        const handleOnDrawerAction = useCallback(() => {
            if (mobile) {
                view.setIsDrawerOpen(false);
            }
        }, [view, mobile]);

        return (
                <RMWCDrawer
                    style={{
                       backgroundColor: "var(--mdc-theme-background, #fff)",
                    }}
                    modal={mobile}
                    dismissible={mobile ? undefined : true}
                    open={view.isDrawerOpen}
                    onClose={() => view.setIsDrawerOpen(false)}>
                    <DrawerHeader>
                        <DivisionUsersMenu
                            onAction={handleOnDrawerAction}
                        />
                    </DrawerHeader>
                    <DrawerContent>
                        <DrawerMenu
                            onAction={handleOnDrawerAction}
                        />
                    </DrawerContent>
                </RMWCDrawer>
        );
    }
);
Drawer.displayName = "Drawer";
