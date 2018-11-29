import * as React from 'react';

import { MDCTopAppBar } from '@material/top-app-bar/index';
import store from '../store';

export class TopAppBar extends React.Component<{ showNavigationIcon: boolean }, { title: string }> {
    constructor(props: { showNavigationIcon: boolean }) {
        super(props);
        this.state = { title: store.view ? store.view.title : "" };
    }
    private topAppBar: MDCTopAppBar;

    clickMenu = () => {
        if (store.view) {
            store.view.isDrawerOpen = !store.view.isDrawerOpen;
        }
    }
    render() {

        const navigationIcon = this.props.showNavigationIcon ?
            <a href="#" onClick={this.clickMenu} className="material-icons mdc-top-app-bar__navigation-icon">menu</a> :
            "";

        return (
            <header className="mdc-top-app-bar">
                <div className="mdc-top-app-bar__row">
                    <section className="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
                        {navigationIcon}
                        <span className="mdc-top-app-bar__title">{this.state.title}</span>
                    </section>
                </div>
            </header>
        );
    }

    componentDidMount() {
        // Instantiation
        const topAppBarElement = document.querySelector('.mdc-top-app-bar');
        this.topAppBar = new MDCTopAppBar(topAppBarElement);
    }

    componentWillUnmount() {
        // TODO: deinit topappbar
    }
}