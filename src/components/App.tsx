import * as React from 'react';
import { TopAppBar } from '../MaterialUI/appbars';
import { Drawer } from '../MaterialUI/drawer';

export class App extends React.Component {
    render() {
        return (
            <>
                <Drawer></Drawer>

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
}
