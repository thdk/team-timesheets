import * as React from 'react'
import { observer } from 'mobx-react-lite';
import { Tab, TabBar } from "@rmwc/tabs";

import { ProjectsTab, goToProjects, ProjectRouteQueryParams } from '../../routes/projects/list';
import { ActiveProjectList, ArchivedProjectList } from '../../containers/projects/list';
import { withAuthentication } from '../../containers/users/with-authentication';
import { RedirectToLogin } from '../../routes/login';
import { useRouterStore } from '../../stores/router-store';

interface ITabData {
    id: ProjectsTab;
    icon?: string;
    text: string;
    canOpen?: () => boolean;
    tabContent: React.ReactNode;
}

export const ProjectsPage = withAuthentication(
    observer(() => {
        const router = useRouterStore();

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

        const query: { tab: ProjectsTab } = router.queryParams as ProjectRouteQueryParams;
        const { tab: activeTabId = validTabs[0].id } = query || {};

        const activeTabIndex = validTabs.findIndex(t => t.id === activeTabId) || 0;

        const tabs = validTabs.map(({ id, icon, text }) => {
            return <Tab
                onClick={goToProjects.bind(null, router, id)}
                iconIndicator={icon}
                key={id}
            >
                {text}
            </Tab>;
        });

        return (
            <>
                <TabBar
                    activeTabIndex={activeTabIndex}
                >
                    {tabs}
                </TabBar>
                {validTabs[activeTabIndex].tabContent}
            </>
        );
    }),
    <RedirectToLogin />,
);
