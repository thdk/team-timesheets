import * as React from 'react';
import { observer } from 'mobx-react-lite';

import { SettingsList } from '../../../components/settings-list';
import { canManageProjects } from '../../../rules/rules';
import { StoreContext } from '../../../contexts/store-context';


export const ArchivedProjectList = observer((props: React.HTMLProps<HTMLDivElement>) => {
    const store = React.useContext(StoreContext);

    return <SettingsList {...props}
        readonly={!canManageProjects(store.user.authenticatedUser)}
        items={store.projects.archivedProjects}
        onToggleSelection={id => store.view.toggleSelection(id, true)}
        onItemClick={id => store.view.toggleSelection(id, true)}
        selection={store.view.selection}
        activeItemId={store.projects.projectId}
    ></SettingsList>;
});

