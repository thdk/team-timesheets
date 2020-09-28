import * as React from 'react';
import { observer } from 'mobx-react-lite';

import { SettingsList } from '../../../components/settings-list';
import { canManageProjects } from '../../../rules';
import { useStore } from '../../../contexts/store-context';

export const ArchivedProjectList = observer((props: React.HTMLProps<HTMLDivElement>) => {
    const store = useStore();

    return <SettingsList {...props}
        readonly={!canManageProjects(store.user.divisionUser)}
        items={store.projects.archivedProjects}
        onToggleSelection={id => store.view.toggleSelection(id)}
        onItemClick={id => store.view.toggleSelection(id)}
        selection={store.view.selection}
        activeItemId={store.projects.projectId}
    ></SettingsList>;
});

