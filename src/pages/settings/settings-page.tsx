import React, { useCallback } from 'react';

import { TaskList } from '../../containers/tasks/list';
import { SettingsTab, SettingsRouteQueryParams } from '../../routes/settings';
import { goToSettings } from '../../internal';
import { ClientList } from '../../containers/clients/list';
import { UserList } from '../../containers/users/list';
import { canReadUsers, canManageTeams } from '../../rules';
import { TeamList } from '../../containers/teams/list';
import { useRouterStore } from '../../stores/router-store';
import { observer } from 'mobx-react-lite';
import { useUserStore } from "../../contexts/user-context";
import { Connections } from './connections';
import { Tabs, ITabData } from '../../components/tabs';

export const SettingsPage = observer(() => {
    const router = useRouterStore();

    const { divisionUser: user } = useUserStore();

          const tabData: ITabData<SettingsTab>[] = [
              { id: "tasks", text: "Tasks", tabContent: <TaskList /> },
              { id: "clients", text: "Clients", tabContent: <ClientList /> },
              { id: "teams", text: "Teams", canOpen: () => canManageTeams(user), tabContent: <TeamList /> },
              { id: "users", text: "Users", canOpen: () => canReadUsers(user), tabContent: <UserList /> },
              { id: "connections", text: "Connections", tabContent: <Connections /> },
        ];

    const onTabChange = useCallback((tabId: SettingsTab) => {
        goToSettings(router, tabId);
    }, [goToSettings, router]);

    const query: { tab: SettingsTab } = router.queryParams as SettingsRouteQueryParams;
    const { tab: activeTabId = undefined } = query || {};

    return (
        <Tabs
            tabData={tabData}
            activeTab={activeTabId}
            onTabChange={onTabChange}
        />
    );
});
