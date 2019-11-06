import * as React from 'react';
import { Drawer } from '../../mdc/drawer';
import { Menu } from '../ui/menu';
import { observe } from 'mobx';
import { IViewStore } from '../../stores/view-store';
import { TopNavigation } from '../ui/top-navigation';
import store from '../../stores/root-store';
import { Fabs } from '../ui/fabs';

export class App extends React.Component {
    private drawerRef?: Drawer | null;

    private unobserveDrawerOpen?: () => void;

    render() {
        return (
            <div className="body-wrapper">
                <Drawer isOpen ref={drawerRef => { this.drawerRef = drawerRef; }}>
                    <Menu></Menu>
                </Drawer>

                <div className="mdc-drawer-app-content">
                    <TopNavigation></TopNavigation>

                    <main className="main-content" id="main-content">
                        <div style={{ paddingBottom: "100px" }} className="mdc-top-app-bar--fixed-adjust">
                            {this.props.children}
                            <Fabs></Fabs>
                        </div>
                    </main>
                </div>

            </div>
        )
    }

    componentDidMount() {
        this.unobserveDrawerOpen = observe<IViewStore, "isDrawerOpen">(store.view, "isDrawerOpen", (change: any) => {
            this.drawerRef && this.drawerRef.toggle(change.newValue);
        });
    }

    componentWillUnmount() {
        this.unobserveDrawerOpen && this.unobserveDrawerOpen();
    }
}

export default App;
