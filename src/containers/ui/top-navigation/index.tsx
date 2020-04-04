import * as React from 'react';
import { observer } from 'mobx-react';
import { TopAppBar } from '../../../mdc/appbars';
import { StoreContext } from '../../../contexts/store-context';

// TODO: move to  mdc/TopAppBar
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
    declare context: React.ContextType<typeof StoreContext>
    static contextType = StoreContext;

    navigationClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const action = this.context.view.navigationAction;
        if (action) action.action();
    }

    render() {
        const { navigationAction: { icon: navigationIcon = {content: "menu", label: "Menu"}} = {}, title } = this.context.view;

        const selectionLength = Array.from(this.context.view.selection.keys()).length;
        const titleText = selectionLength
         ? `${selectionLength} selected`
         : title;

        return (
            <TopAppBar mode={selectionLength ? "contextual" : "standard"} navigationIcon={navigationIcon.content} title={titleText} navigationClick={this.navigationClick} showNavigationIcon={true}></TopAppBar>
        )
    }
}