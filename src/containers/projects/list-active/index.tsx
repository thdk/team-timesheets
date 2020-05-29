import React, { useState } from 'react';
import { canEditProject, canManageProjects } from '../../../rules/rules';
import { SettingsList } from '../../../components/settings-list';
import { GoToProject } from '../../../internal';
import { useUserStore } from '../../../stores/user-store';
import { useViewStore } from '../../../stores/view-store';
import { useProjectStore } from '../../../stores/project-store';

export const ActiveProjectList = (props: React.HTMLProps<HTMLDivElement>) => {
    const { authenticatedUser, authenticatedUserId } = useUserStore();
    const { selection, toggleSelection } = useViewStore();
    const {
        activeProjects,
        projectsCollection,
        projectId,
        setProjectId,
    } = useProjectStore();

    const [goToProject, setGoToProject] = useState<string | undefined>(undefined);

    const handleItemClicked = (id: string | undefined) => {
        if (!id) return;

        // User has started to select items using the checkboxes,
        // While in select mode, simply select the items checkbox instead of
        // opening the clicked row.
        if (selection.size) {
            toggleSelection(id);
        } else {
            const project = projectsCollection.get(id);
            if (project && canEditProject(project.data!, authenticatedUser, authenticatedUserId)
            ) {
                setGoToProject(id);
            }
        }
    };

    const onSelectItem = (id: string) => {
        if (projectId) {
            setProjectId(undefined);
        }

        toggleSelection(id);
    };

    return goToProject
        ? <GoToProject id={goToProject} />
        : (
            <SettingsList {...props}
                readonly={!canManageProjects(authenticatedUser)}
                items={activeProjects}
                onToggleSelection={onSelectItem}
                onItemClick={handleItemClicked}
                selection={selection}
                activeItemId={projectId}
            ></SettingsList>
        );
};

