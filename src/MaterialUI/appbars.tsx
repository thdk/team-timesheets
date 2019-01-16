import * as React from 'react';

import { MDCTopAppBar } from '@material/top-app-bar/index';
import { observer } from 'mobx-react';
import store from '../stores/RootStore';

export interface TopAppBarProps {
    showNavigationIcon: boolean,
    navigationIcon: "menu" | "arrow_back" | "arrow_upward";
    mode: "contextual" | "standard";
    title?: string;
    navigationClick?: (e: React.MouseEvent) => void;
}

@observer
export class TopAppBar extends React.Component<TopAppBarProps> {
    render() {
        const { title, navigationIcon, navigationClick, mode } = this.props;

        const primaryAction = mode === "standard"
            ? <a href="#" onClick={navigationClick} className="material-icons mdc-top-app-bar__navigation-icon">{navigationIcon}</a>
            : <a href="#" onClick={this.onLeaveContextualMode} className="material-icons mdc-top-app-bar__navigation-icon">close</a>

        return (
            <header className="mdc-top-app-bar app-bar">
                <div className="mdc-top-app-bar__row">
                    <section className="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
                        {primaryAction}
                        <span className="mdc-top-app-bar__title">{title}</span>
                    </section>
                    <section className="mdc-top-app-bar__section mdc-top-app-bar__section--align-end" role="toolbar">
                        <AppBarActions></AppBarActions>
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

    onLeaveContextualMode() {
        store.view.selection.clear();
    }
}

@observer class AppBarActions extends React.Component {
    render() {
        return store.view.actions.map((a, i) => {
            return <AppBarAction key={i} onClick={a.action.bind(a.action, Array.from(store.view.selection.keys()))} icon={a.icon}></AppBarAction>
        });
    }
}

interface IAppBarAction {
    onClick: (ids?: string[]) => void;
    icon: string;
}

class AppBarAction extends React.Component<IAppBarAction> {
    render() {
        const { icon } = this.props;

        const className = "rst-action mdc-top-app-bar__action-item mdc-icon-button";
        return <button onClick={this.onClick.bind(this)} data-action-id={icon} className={className} aria-label={icon}
            aria-hidden="true" aria-pressed="false">
            <i className="material-icons mdc-icon-button__icon">{icon}</i>
        </button>
    }

    onClick() {
        this.props.onClick();
    }
}