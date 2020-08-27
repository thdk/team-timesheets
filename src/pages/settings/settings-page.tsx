import * as React from 'react';

import { Preferences } from './preferences';
import { TaskList } from '../../containers/tasks/list';
import { SettingsTab, SettingsRouteQueryParams } from '../../routes/settings';
import { goToSettings } from '../../internal';
import { ClientList } from '../../containers/clients/list';
import { UserList } from '../../containers/users/list';
import { canReadUsers, canManageTeams } from '../../rules/rules';
import { TeamList } from '../../containers/teams/list';
import { useRouterStore } from '../../stores/router-store';
import { useMemo } from 'react';
import { useCallback } from 'react';
import { Tab, TabBar } from "@rmwc/tabs";
import { observer } from 'mobx-react-lite';
import { useUserStore } from "../../contexts/user-context";

interface ITabData {
    id: SettingsTab;
    icon?: string;
    text: string;
    canOpen?: () => boolean;
    tabContent: React.ReactNode;
}

export const SettingsPage = observer(() => {
    const router = useRouterStore();

    const { authenticatedUser: user } = useUserStore();

    const validTabs = useMemo(() => {
        const tabData: ITabData[] = [
            { id: "preferences", text: "Preferences", canOpen: () => !!user, tabContent: <Preferences /> },
            { id: "tasks", text: "Tasks", tabContent: <TaskList /> },
            { id: "clients", text: "Clients", tabContent: <ClientList /> },
            { id: "teams", text: "Teams", canOpen: () => canManageTeams(user), tabContent: <TeamList /> },
            { id: "users", text: "Users", canOpen: () => canReadUsers(user), tabContent: <UserList /> }
        ];
        return tabData.filter(t => !t.canOpen || t.canOpen());
    }, [user]);

    const onTabClick = useCallback((tabId: SettingsTab) => {
        goToSettings(router, tabId);
    }, [goToSettings, router]);

    if (!validTabs.length) return <></>

    const query: { tab: SettingsTab } = router.queryParams as SettingsRouteQueryParams;
    const { tab: activeTabId = validTabs[0].id } = query || {};

    const activeTabIndex = validTabs.findIndex(t => t.id === activeTabId) || 0;

    const tabs = validTabs.map(({ icon, id, text }) => {
        return <Tab
            onClick={onTabClick.bind(null, id)}
            key={id}
            iconIndicator={icon}
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
});
