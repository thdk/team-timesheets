import * as React from 'react';
import { observer } from '../../node_modules/mobx-react';
import { TopAppBar } from '../MaterialUI/appbars';
import store from '../store';

// TODO: move to  MaterialUI/TopAppBar
export interface ITopAppBarProps {
    navigation: JSX.Element;
}

export enum NavigationType {
    menu,
    back,
    up
}

@observer
export class TopNavigation extends React.Component {
    navigationClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const action = store.view.navigationAction;
        if (action) action.action();
    }

    render() {
        const { navigationAction: { icon: navigationIcon = "menu"} = {}, title } = store.view;
        return (
            <TopAppBar navigationIcon={navigationIcon} title={title} navigationClick={this.navigationClick} showNavigationIcon={true}></TopAppBar>
        )
    }
}