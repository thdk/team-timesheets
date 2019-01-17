import * as React from 'react';

import { MDCTopAppBar } from '@material/top-app-bar/index';
import { observer } from 'mobx-react';
import store from '../stores/RootStore';
import { IViewAction } from '../stores/ViewStore';

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

        const classNames = ["mdc-top-app-bar", "app-bar"];
        if (mode === "contextual") classNames.push("contextual");

        return (
            <header className={classNames.join(" ")}>
                <div className="mdc-top-app-bar__row">
                    <section className="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
                        {primaryAction}
                        <span className="mdc-top-app-bar__title">{title}</span>
                    </section>
                    <section className="mdc-top-app-bar__section mdc-top-app-bar__section--align-end" role="toolbar">
                        <AppBarActions contextual={mode === "contextual"}></AppBarActions>
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

    onLeaveContextualMode(e: React.MouseEvent) {
        e.preventDefault();
        store.view.selection.clear();
    }
}

export interface IAppBarActionsProps {
    contextual?: boolean;
}

@observer class AppBarActions extends React.Component<IAppBarActionsProps> {
    render() {
        const { contextual = false } = this.props;
        return store.view.actions.filter(a => !!a.contextual === contextual).map((a, i) => {
            return !a.selection || a.selection.size
                ? <AppBarAction key={i} onClick={this.onClick.bind(this, a)} icon={a.icon}></AppBarAction>
                : <div key={i}></div>;
        });
    }

    onClick(viewAction: IViewAction) {
        viewAction.action(viewAction.selection ? Array.from(viewAction.selection.keys()) : undefined);
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