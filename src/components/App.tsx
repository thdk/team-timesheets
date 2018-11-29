import * as React from 'react';
import { TopAppBar } from '../MaterialUI/appbars';

export class App extends React.Component {
    render() {
        return (
            <div>
                <TopAppBar showNavigationIcon={true}></TopAppBar>
                <div className="mdc-top-app-bar--fixed-adjust">
                    {this.props.children}
                </div>
            </div>
        )
    }
}
