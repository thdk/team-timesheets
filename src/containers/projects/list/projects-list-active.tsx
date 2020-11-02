import React, { useState } from 'react';
import { canEditProject, canManageProjects } from '../../../rules';
import { SettingsList } from '../../../components/settings-list';
import { GoToProject } from '../../../internal';
import { useUserStore } from "../../../contexts/user-context";
import { useViewStore } from '../../../contexts/view-context';
import { useProjectStore } from "../../../contexts/project-context";
import { observer } from 'mobx-react-lite';

export const ActiveProjectList = observer((props: React.HTMLProps<HTMLDivElement>) => {
    const user = useUserStore();
    const view = useViewStore();
    const projects = useProjectStore();

    const [goToProject, setGoToProject] = useState<string | undefined>(undefined);

    const handleItemClicked = (id: string) => {
        // User has started to select items using the checkboxes,
        // While in select mode, simply select the items checkbox instead of
        // opening the clicked row.
        if (view.selection.size) {
            view.toggleSelection(id);
        } else {
            const project = projects.collection.get(id);
            if (project && canEditProject(project.data!, user.divisionUser, user.divisionUser?.id)
            ) {
                setGoToProject(id);
            }
        }
    };

    const onSelectItem = (id: string) => {
        view.toggleSelection(id);
    };

    return goToProject
        ? <GoToProject id={goToProject} />
        : (
            <SettingsList {...props}
                readonly={!canManageProjects(user.divisionUser)}
                items={projects.activeProjects}
                onToggleSelection={onSelectItem}
                onItemClick={handleItemClicked}
                selection={view.selection}
                activeItemId={projects.activeDocumentId}
            ></SettingsList>
        );
});

