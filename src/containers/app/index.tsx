import * as React from 'react';
import { TopNavigation } from '../ui/top-navigation';
import { Fabs } from '../ui/fabs';
import Drawer from '../drawer';
import { DrawerAppContent } from '@rmwc/drawer';
import { observer } from 'mobx-react-lite';
import { StoreProvider } from '../../contexts/store-context';
import { inject } from 'mobx-react';
import { IRootStore } from '../../stores/root-store';

interface IProps extends React.HTMLProps<HTMLDivElement> {
    store?: IRootStore
}

export const App = inject("store")(
    observer(
        (props: IProps) => {
            const { store } = props;
            if (!store) {
                throw new Error("App needs mobx-react Provider");
            }

            return <StoreProvider value={store}>
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
            </StoreProvider>;
        }
    )
);
