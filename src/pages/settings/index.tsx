import * as React from 'react';
import { observer } from 'mobx-react';

import { TapBar, Tab, TabIcon } from '../../mdc/tabbar';
import Preferences from './preferences';
import store from '../../stores/root-store';
import { TaskList } from '../../containers/tasks/list';
import { SettingsTab } from '../../routes/settings';
import { goToSettings, RedirectToLogin } from '../../internal';
import { ClientList } from '../../containers/clients/list';
import { UserList } from '../../containers/users/list';
import { canReadUsers, canManageTeams } from '../../rules/rules';
import { TeamList } from '../../containers/teams/list';
import { withAuthenticatedUser, IWithAuthenticatedUserProps } from '../../containers/users/with-authenticated-user';
import { withAuthentication } from '../../containers/users/with-authentication';

interface ITabData {
    id: SettingsTab;
    icon?: string;
    text: string;
    canOpen?: () => boolean;
    tabContent: React.ReactNode;
}

type Props = IWithAuthenticatedUserProps;

@observer
class Settings extends React.Component<Props> {
    render() {
        const { authenticatedUser: user } = this.props;

        const tabData: ITabData[] = [
            { id: "preferences", text: "Preferences", canOpen: () => !!user, tabContent: <Preferences /> },
            { id: "tasks", text: "Tasks", tabContent: <TaskList /> },
            { id: "clients", text: "Clients", tabContent: <ClientList /> },
            { id: "teams", text: "Teams", canOpen: () => canManageTeams(user), tabContent: <TeamList /> },
            { id: "users", text: "Users", canOpen: () => canReadUsers(user), tabContent: <UserList /> }
        ];

        const validTabs = tabData.filter(t => !t.canOpen || t.canOpen());

        if (!validTabs.length) return <></>

        const query: { tab: SettingsTab } = store.router.queryParams;
        const { tab: activeTabId = validTabs[0].id } = query || {};

        let activeTab = validTabs.filter(t => t.id === activeTabId)[0];
        if (!activeTab) activeTab = validTabs[0];


        const tabs = validTabs.map(t => {
            const icon = t.icon ? <TabIcon icon={t.icon}></TabIcon> : undefined;
            return <Tab onClick={goToSettings.bind(this, t.id)} isActive={activeTab.id === t.id} key={t.id} {...t} icon={icon}></Tab>;
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
    withAuthenticatedUser(Settings),
    <RedirectToLogin />,
);