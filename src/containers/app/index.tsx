import * as React from 'react';
import { Fabs } from '../ui/fabs';
import { Drawer } from '../drawer';
import { DrawerAppContent } from '@rmwc/drawer';
import { observer } from 'mobx-react-lite';
import { IRootStore } from '../../stores/root-store';
import { useStore } from '../../contexts/store-context';
import { TopBar } from '../ui/top-bar';

interface IProps extends React.HTMLProps<HTMLDivElement> {
    store?: IRootStore
}

export const App = observer(
    (props: IProps) => {
        const store = useStore();

        // Wait for user initialization
        if (!store.user.isAuthInitialised) return <></>;

        return (
            <div className="body-wrapper">
                <Drawer />

                <DrawerAppContent>
                    <TopBar />

                    <main className="main-content" id="main-content">
                        <div style={{ paddingBottom: "100px" }} className="mdc-top-app-bar--fixed-adjust">
                            {props.children}
                            <Fabs></Fabs>
                        </div>
                    </main>
                </DrawerAppContent>

            </div>
        );
    }
);
