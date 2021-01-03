import React, { useCallback } from 'react';

import { TaskList } from '../../containers/tasks/list';
import { SettingsTab, SettingsRouteQueryParams } from '../../routes/settings';
import { goToSettings } from '../../internal';
import { ClientList } from '../../containers/clients/list';
import { UserList } from '../../containers/users/list';
import { canReadUsers, canManageTeams, canDeleteTask } from '../../rules';
import { TeamList } from '../../containers/teams/list';
import { useRouterStore } from '../../stores/router-store';
import { observer } from 'mobx-react-lite';
import { useUserStore } from "../../contexts/user-context";
import { Tabs, ITabData } from '../../components/tabs';
import { useEffect } from 'react';
import { useViewStore } from '../../contexts/view-context';
import { goToNewTask } from '../../routes/tasks/detail';
import { IViewAction } from '../../stores/view-store';
import { useTasks } from '../../contexts/task-context';
import { transaction } from 'mobx';

const TasksTab = () => {
    const view = useViewStore();
    const router = useRouterStore();
    const tasks = useTasks();
    const user = useUserStore();

    useEffect(
        () => {
            const deleteAction: IViewAction | undefined = canDeleteTask(user.divisionUser)
                ? {
                    action: () => {
                        view.selection.size && tasks.deleteDocuments(
                            {
                                useFlag: false,
                            },
                            ...view.selection.keys()
                        );
                        view.selection.clear();
                    },
                    icon: { label: "Delete", content: "delete" },
                    shortKey: { key: "Delete", ctrlKey: true },
                    contextual: true,
                    selection: view.selection,
                }
                : undefined;

            view.setActions([deleteAction].filter(a => a !== undefined) as IViewAction[]);

            view.setFabs([
                {
                    action: () => goToNewTask(router),
                    icon: {
                        content: "add",
                        label: "New task",
                    },
                    shortKey: {
                        key: "a",
                    },
                }
            ]);

            return () => {
                transaction(() => {
                    view.setFabs([]);
                    view.setActions([]);
                });
            };
        },
        [view],
    );

    return (
        <TaskList />
    );
};

export const SettingsPage = observer(() => {
    const router = useRouterStore();

    const { divisionUser: user } = useUserStore();

    const tabData: ITabData<SettingsTab>[] = [
        { id: "tasks", text: "Tasks", tabContent: <TasksTab /> },
        { id: "clients", text: "Clients", tabContent: <ClientList /> },
        { id: "teams", text: "Teams", canOpen: () => canManageTeams(user), tabContent: <TeamList /> },
        { id: "users", text: "Users", canOpen: () => canReadUsers(user), tabContent: <UserList /> },
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
