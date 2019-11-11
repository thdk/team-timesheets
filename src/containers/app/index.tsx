import * as React from 'react';
import { TopNavigation } from '../ui/top-navigation';
import { Fabs } from '../ui/fabs';
import Drawer from '../drawer';
import { DrawerAppContent } from '@rmwc/drawer';
import store from '../../stores/root-store';
import { observer } from 'mobx-react-lite';

type Props = React.HTMLProps<HTMLDivElement>;

export const App = observer((props: Props) => {
    return store.user.isAuthInitialised
        ? (
            <div className="body-wrapper">
                <Drawer />

                <DrawerAppContent>
                    <TopNavigation></TopNavigation>

                    <main className="main-content" id="main-content">
                        <div style={{ paddingBottom: "100px" }} className="mdc-top-app-bar--fixed-adjust">
                            {props.children}
                            <Fabs></Fabs>
                        </div>
                    </main>
                </DrawerAppContent>

            </div>
        )
        : <></>;
});
