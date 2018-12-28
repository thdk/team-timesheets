import * as React from 'react';
import { TapBar, Tab } from '../../../MaterialUI/tabbar';
import { observer } from 'mobx-react';
import { Preferences } from '../Preferences';
import { Icon } from '../../../MaterialUI/icon';
import store from '../../../stores/RootStore';
import { TaskList } from './Tasks/TaskList';
import { ProjectList } from './Projects/ProjectList';
import { SettingsTab } from '../../../routes/settings';
import { goToSettings } from '../../../internal';

interface ITabData {
    id: SettingsTab;
    icon?: string;
    text: string;
}

@observer
export class Settings extends React.Component {
    render() {
        const tabData: ITabData[] = [
            { id: "preferences", text: "Preferences" },
            { id: "tasks", text: "Tasks" },
            { id: "projects", text: "Projects" }
        ];

        const query: { tab: SettingsTab } = store.router.queryParams;
        const { tab: activeTab = undefined } = query || {};
        const tabs = tabData.map(t => {
            const icon = t.icon ? <Icon icon={t.icon}></Icon> : undefined;
            return <Tab onClick={goToSettings.bind(this, t.id)} isActive={activeTab === t.id} key={t.id} {...t} icon={icon}></Tab>
        });

        let content: React.ReactNode;
        switch (activeTab) {
            case "preferences":
                content = <Preferences></Preferences>;
                break;
            case "projects":
                content = <ProjectList></ProjectList>;
                break;
            case "tasks":
                content = <TaskList></TaskList>;
                break;
        }

        return (
            <>
                <TapBar>{tabs}</TapBar>
                {content}
            </>
        );
    }
}