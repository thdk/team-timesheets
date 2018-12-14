import * as React from 'react';
import { Drawer } from '../MaterialUI/drawer';
import { Menu } from './Menu';
import store from '../store';
import { observe } from 'mobx';
import { IViewStore } from '../stores/ViewStore';
import { TopNavigation } from './TopNavigation';

export class App extends React.Component {
    private drawerRef?: Drawer | null;

    private unobserveDrawerOpen?: () => void;

    render() {
        return (
            <div className="body-wrapper">
                <Drawer ref={drawerRef => { this.drawerRef = drawerRef; }}>
                    <Menu></Menu>
                </Drawer>

                <div className="mdc-drawer-app-content">
                    <TopNavigation></TopNavigation>

                    <main className="main-content" id="main-content">
                        <div className="mdc-top-app-bar--fixed-adjust">
                            {this.props.children}
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
