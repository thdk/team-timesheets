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
import { List, ListItem, ListItemGraphic } from '@rmwc/list';
import { useUserStore } from '../../contexts/user-context';

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
        const user = useUserStore();

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
                    <List
                        style={{
                            alignSelf: "flex-end"
                        }}
                    >
                        <a
                            href="https://github.com/thdk/team-timesheets/issues/new"                            
                        >
                            <ListItem>
                                <ListItemGraphic
                                    icon={(
                                        <svg
                                            style={{
                                                width: '24px',
                                                height: '24px',
                                            }}
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                fill={user.divisionUser?.theme === "dark" ? "#ffffff" : "#000000"}
                                                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                                            />
                                        </svg>
                                    )}
                                />
                                Report issue
                            </ListItem>
                        </a>

                    </List>
                </DrawerContent>
            </RMWCDrawer>
        );
    }
);
Drawer.displayName = "Drawer";
