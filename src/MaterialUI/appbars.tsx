import * as React from 'react';

import { MDCTopAppBar } from '@material/top-app-bar/index';
import store from '../store';
import { observer } from 'mobx-react';

export interface TopAppBarProps {
    showNavigationIcon: boolean
}

@observer
export class TopAppBar extends React.Component<TopAppBarProps, { title: string }> {
    clickMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        store.view.isDrawerOpen = !store.view.isDrawerOpen;
    }
    render() {
        const navigationIcon = this.props.showNavigationIcon ?
            <a href="#" onClick={this.clickMenu} className="material-icons mdc-top-app-bar__navigation-icon">menu</a> :
            "";

        const actions = store.view.actions.map((a, i) => {
            let className = "rst-action mdc-top-app-bar__action-item mdc-icon-button";
            if (a.isActive) className += " mdc-icon-button--on";

            return <button onClick={a.action} key={i} data-action-id={a.icon} className={className} aria-label="${action.text}"
                aria-hidden="true" aria-pressed="false">
                <i className="material-icons mdc-icon-button__icon">{a.icon}</i>
            </button>
        });

        return (
            <header className="mdc-top-app-bar app-bar">
                <div className="mdc-top-app-bar__row">
                    <section className="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
                        {navigationIcon}
                        <span className="mdc-top-app-bar__title">{store.view.title}</span>
                    </section>
                    <section className="mdc-top-app-bar__section mdc-top-app-bar__section--align-end" role="toolbar">
                        {actions}
                    </section>
                </div>
            </header>
        );
    }

    componentDidMount() {
        // Instantiation
        const topAppBarElement = document.querySelector('.mdc-top-app-bar');
        MDCTopAppBar.attachTo(topAppBarElement);
    }

    componentWillUnmount() {
        // TODO: deinit topappbar
    }
}