import React, { useState } from 'react';
import { canEditProject, canManageProjects } from '../../../rules';
import { SettingsList } from '../../../components/settings-list';
import { GoToProject } from '../../../internal';
import { useUserStore } from '../../../stores/user-store';
import { useViewStore } from '../../../stores/view-store';
import { useProjectStore } from '../../../stores/project-store';
import { observer } from 'mobx-react-lite';

export const ActiveProjectList = observer((props: React.HTMLProps<HTMLDivElement>) => {
    const { authenticatedUser, authenticatedUserId } = useUserStore();
    const { selection, toggleSelection } = useViewStore();
    const projects = useProjectStore();

    const [goToProject, setGoToProject] = useState<string | undefined>(undefined);

    const handleItemClicked = (id: string) => {
        // User has started to select items using the checkboxes,
        // While in select mode, simply select the items checkbox instead of
        // opening the clicked row.
        if (selection.size) {
            toggleSelection(id);
        } else {
            const project = projects.projectsCollection.get(id);
            if (project && canEditProject(project.data!, authenticatedUser, authenticatedUserId)
            ) {
                setGoToProject(id);
            }
        }
    };

    const onSelectItem = (id: string) => {
        toggleSelection(id);
    };

    return goToProject
        ? <GoToProject id={goToProject} />
        : (
            <SettingsList {...props}
                readonly={!canManageProjects(authenticatedUser)}
                items={projects.activeProjects}
                onToggleSelection={onSelectItem}
                onItemClick={handleItemClicked}
                selection={selection}
                activeItemId={projects.projectId}
            ></SettingsList>
        );
});

