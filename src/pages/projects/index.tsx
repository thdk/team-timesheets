
import { observer } from 'mobx-react';

import { TapBar, Tab, TabIcon } from '../../mdc/tabbar';
import store from '../../stores/root-store';
import { ProjectsTab, goToProjects } from '../../routes/projects/list';
import { ActiveProjectList } from '../../containers/projects/list-active';
import { ArchivedProjectList } from '../../containers/projects/list-archived';
import React from 'react';

interface ITabData {
    id: ProjectsTab;
    icon?: string;
    text: string;
    canOpen?: () => boolean;
    tabContent: React.ReactNode;
}

@observer
export class Projects extends React.Component {
    render() {
        const tabData: ITabData[] = [
            { id: "active", text: "Active projects", canOpen: () => !!store.user.authenticatedUser, tabContent: <ActiveProjectList /> },
            { id: "archived", text: "Archived projects", canOpen: () => !!store.user.authenticatedUser, tabContent: <ArchivedProjectList /> },
        ];

        const validTabs = tabData.filter(t => !t.canOpen || t.canOpen());

        if (!validTabs.length) return <></>

        const query: { tab: ProjectsTab } = store.router.queryParams;
        const { tab: activeTabId = validTabs[0].id } = query || {};

        let activeTab = validTabs.filter(t => t.id === activeTabId)[0];
        if (!activeTab) activeTab = validTabs[0];


        const tabs = validTabs.map(t => {
            const icon = t.icon ? <TabIcon icon={t.icon}></TabIcon> : undefined;
            return <Tab onClick={goToProjects.bind(this, t.id)} isActive={activeTab.id === t.id} key={t.id} {...t} icon={icon}></Tab>;
        });

        return (
            <>
                <TapBar>{tabs}</TapBar>
                {activeTab.tabContent}
            </>
        );
    }
}