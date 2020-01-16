import * as React from 'react';
import { observer } from 'mobx-react-lite';
import store from '../../../stores/root-store';
import { canEditProject, canManageProjects } from '../../../rules/rules';
import { SettingsList } from '../../../components/settings-list';
import { goToProject } from '../../../internal';

export const ActiveProjectList = observer((props: React.HTMLProps<HTMLDivElement>) => {

    const handleItemClicked = (id: string | undefined) => {
        if (!id) return;

        // User has started to select items using the checkboxes,
        // While in select mode, simply select the items checkbox instead of
        // opening the clicked row.
        if (store.view.selection.size) {
            store.view.toggleSelection(id, true);
        } else {
            const project = store.projects.projectsCollection.get(id);
            if (project
                && canEditProject(project.data!, store.user.authenticatedUser, store.user.userId)
            ) {
                // store.projects.setProjectId(id);
                goToProject(id);
            }
        }
    };

    const onSelectItem = (id: string) => {
        if (store.projects.projectId) {
            store.projects.setProjectId(undefined);
        }

        store.view.toggleSelection(id, true);
    };

    return <SettingsList {...props}
        readonly={!canManageProjects(store.user.authenticatedUser)}
        items={store.projects.activeProjects}
        onToggleSelection={onSelectItem}
        onItemClick={handleItemClicked}
        selection={store.view.selection}
        activeItemId={store.projects.projectId}
    ></SettingsList>;
});

