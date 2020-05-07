
import { observer } from 'mobx-react';
import * as React from 'react'

import { TapBar, Tab, TabIcon } from '../../mdc/tabbar';
import { ProjectsTab, goToProjects, ProjectRouteQueryParams } from '../../routes/projects/list';
import { ActiveProjectList } from '../../containers/projects/list-active';
import { ArchivedProjectList } from '../../containers/projects/list-archived';
import { withAuthentication } from '../../containers/users/with-authentication';
import { RedirectToLogin } from '../../routes/login';
import { StoreContext } from '../../contexts/store-context';

interface ITabData {
    id: ProjectsTab;
    icon?: string;
    text: string;
    canOpen?: () => boolean;
    tabContent: React.ReactNode;
}

@observer
class Projects extends React.Component {
    declare context: React.ContextType<typeof StoreContext>
    static contextType = StoreContext;

    render() {
        const tabData: ITabData[] = [
            {
                id: "active",
                text: "Active projects",
                tabContent: <ActiveProjectList />,
            },
            {
                id: "archived",
                text: "Archived projects",
                tabContent: <ArchivedProjectList />,
            },
        ];

        const validTabs = tabData.filter(t => !t.canOpen || t.canOpen());

        if (!validTabs.length) return <></>

        const query: { tab: ProjectsTab } = this.context.router.queryParams as ProjectRouteQueryParams;
        const { tab: activeTabId = validTabs[0].id } = query || {};

        let activeTab = validTabs.filter(t => t.id === activeTabId)[0];
        if (!activeTab) activeTab = validTabs[0];


        const tabs = validTabs.map(t => {
            const icon = t.icon ? <TabIcon icon={t.icon}></TabIcon> : undefined;
            return <Tab onClick={goToProjects.bind(this, this.context, t.id)} isActive={activeTab.id === t.id} key={t.id} {...t} icon={icon}></Tab>;
        });

        return (
            <>
                <TapBar>{tabs}</TapBar>
                {activeTab.tabContent}
            </>
        );
    }
}

export default withAuthentication(
    Projects,
    <RedirectToLogin />,
);
