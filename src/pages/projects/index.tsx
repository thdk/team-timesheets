
import { observer } from 'mobx-react';
import * as React from 'react'

import { Tab, TabBar } from "@rmwc/tabs";
import { ProjectsTab, goToProjects, ProjectRouteQueryParams } from '../../routes/projects/list';
import { ActiveProjectList, ArchivedProjectList } from '../../containers/projects/list';
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

        const activeTabIndex = validTabs.findIndex(t => t.id === activeTabId) || 0;

        const tabs = validTabs.map(({id, icon, text})=> {
            return <Tab
            onClick={goToProjects.bind(this, this.context.router, id)}
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
    }
}

export default withAuthentication(
    Projects,
    <RedirectToLogin />,
);
