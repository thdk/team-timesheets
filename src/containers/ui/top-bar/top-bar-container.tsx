import * as React from 'react';

import { observer } from 'mobx-react-lite';

import { TopAppBar, TopAppBarRow, TopAppBarSection, TopAppBarNavigationIcon, TopAppBarTitle } from '@rmwc/top-app-bar';
import { TopBarActions } from './top-bar-actions-container';
import { useViewStore } from '../../../contexts/view-context';

export const TopBar = observer(() => {
    const view = useViewStore();

    const onLeaveContextualMode = (e: React.MouseEvent) => {
        e.preventDefault();
        view.selection.clear();
    };

    const navigationClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const action = view.navigationAction;
        action.action();
    }
    const { navigationAction: { icon: navigationIcon }} = view;
    const selectionLength = Array.from(view.selection.keys()).length;
    const contextual = !!selectionLength;

    const primaryAction = !contextual
        ? <TopAppBarNavigationIcon icon={navigationIcon.content} onClick={navigationClick} />
        : <TopAppBarNavigationIcon icon="close" onClick={onLeaveContextualMode} />

    const titleText = selectionLength
     ? `${selectionLength} selected`
     : view.title;

    return (
        <TopAppBar className={contextual ? "contextual" : undefined}>
            <TopAppBarRow>
                <TopAppBarSection alignStart>
                    {primaryAction}
                    <TopAppBarTitle>{titleText}</TopAppBarTitle>
                </TopAppBarSection>
                <TopAppBarSection alignEnd>
                    <TopBarActions/>
                </TopAppBarSection>
            </TopAppBarRow>
        </TopAppBar>
    );
});