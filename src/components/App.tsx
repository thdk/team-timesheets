import * as React from 'react';
import { TopAppBar } from '../MaterialUI/appbars';
import { Drawer } from '../MaterialUI/drawer';
import { Menu } from './Menu';
import store, { IViewStore } from '../store';
import { observe } from 'mobx';

export class App extends React.Component {
    private drawerRef?: Drawer | null;

    private unobserveDrawerOpen?: () => void;

    render() {
        return (
            <>
                <Drawer ref={drawerRef => { this.drawerRef = drawerRef; }}>
                    <Menu></Menu>
                </Drawer>

                <div className="mdc-drawer-app-content">
                    <TopAppBar showNavigationIcon={true}></TopAppBar>

                    <main className="main-content" id="main-content">
                        <div className="mdc-top-app-bar--fixed-adjust">
                            {this.props.children}
                        </div>
                    </main>
                </div>

            </>
        )
    }

    componentDidMount() {
        this.unobserveDrawerOpen = observe<IViewStore, "isDrawerOpen">(store.view, "isDrawerOpen", change => {
            this.drawerRef && this.drawerRef.toggle(change.newValue);
        });
    }

    componentWillUnmount() {
        this.unobserveDrawerOpen && this.unobserveDrawerOpen();
    }
}
