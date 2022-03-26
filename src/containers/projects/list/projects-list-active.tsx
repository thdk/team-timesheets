import React, { useState } from 'react';
import { canEditProject, canManageProjects } from '../../../rules';
import { GoToProject } from '../../../internal';
import { useUserStore } from "../../../contexts/user-context";
import { useViewStore } from '../../../contexts/view-context';
import { useProjectStore } from "../../../contexts/project-context";
import { observer } from 'mobx-react-lite';
import { Checkbox } from '@rmwc/checkbox';
import { DataTable, DataTableContent, DataTableHead, DataTableRow, DataTableHeadCell, DataTableBody, DataTableCell } from '@rmwc/data-table';
import { Icon } from '@rmwc/icon';
import { UserName } from '../../users/user-name';

export const ActiveProjectList = observer(() => {
    const user = useUserStore();
    const view = useViewStore();
    const projects = useProjectStore();

    const [goToProject, setGoToProject] = useState<string | undefined>(undefined);
    const canUserManageProjects = canManageProjects(user.divisionUser);

    const handleItemClicked = (id: string) => {
        if (!canUserManageProjects) {
            return;
        }

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

    if (goToProject) {
        return <GoToProject id={goToProject} />;
    }


    return projects.activeProjects.length
        ? (
            <DataTable
                style={{
                    width: "100%",
                    borderRadius: "0",
                    borderLeft: "0",
                    borderRight: "0",
                }}
                theme={["textPrimaryOnBackground"]}
            >
                <DataTableContent>
                    <DataTableHead>
                        <DataTableRow>
                            <DataTableHeadCell
                                width={56}
                            />
                            <DataTableHeadCell>Name</DataTableHeadCell>
                            <DataTableHeadCell
                                alignEnd
                            >
                                Project owner
                            </DataTableHeadCell>
                            {canUserManageProjects && <DataTableHeadCell alignEnd width={56}>Select</DataTableHeadCell>}
                        </DataTableRow>
                    </DataTableHead>
                    <DataTableBody>
                        {
                            projects.activeProjects.map(({
                                icon,
                                name,
                                createdBy,
                                id,
                            }) => {
                                return (
                                    <DataTableRow
                                        key={id}
                                        onClick={() => handleItemClicked(id)}
                                    >
                                        <DataTableCell
                                        >
                                            {icon ? <Icon icon={icon} /> : undefined}
                                        </DataTableCell>
                                        <DataTableCell>
                                            {name}
                                        </DataTableCell>
                                        <DataTableCell alignEnd>
                                            <UserName
                                                id={createdBy}
                                            />
                                        </DataTableCell>
                                        {
                                            canUserManageProjects && <DataTableCell alignEnd width={56}>
                                                <Checkbox
                                                    checked={view.selection.has(id)}
                                                    onChange={() => view.toggleSelection(id)}
                                                    onClick={(e: React.MouseEvent) => {
                                                        e.stopPropagation();
                                                    }}
                                                />
                                            </DataTableCell>
                                        }
                                    </DataTableRow>
                                );
                            })
                        }
                    </DataTableBody>
                </DataTableContent>
            </DataTable>
        )
        : null;
});

