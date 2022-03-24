import * as React from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from '../../../contexts/store-context';

import {
    DataTable,
    DataTableContent,
    DataTableHead,
    DataTableRow,
    DataTableHeadCell,
    DataTableBody,
    DataTableCell,
} from '@rmwc/data-table';

import { Checkbox } from '@rmwc/checkbox';
import { Icon } from '@rmwc/icon';
import { canManageProjects } from '../../../rules';
import { useUserStore } from '../../../contexts/user-context';
import { UserName } from '../../users/user-name';

export const ArchivedProjectList = observer((_props: React.HTMLProps<HTMLDivElement>) => {
    const store = useStore();

    const user = useUserStore();

    const canUserManageProjects = canManageProjects(user.divisionUser);

    return store.projects.archivedProjects.length
        ? (
            <DataTable
                style={{
                    width: "100%",
                    borderRadius: "0",
                    borderLeft: "0",
                    borderRight: "0",
                }}
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
                            store.projects.archivedProjects.map(({
                                icon,
                                name,
                                createdBy,
                                id,
                            }) => {
                                return (
                                    <DataTableRow
                                        key={id}
                                        onClick={() => canUserManageProjects && store.view.toggleSelection(id)}

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
                                                    checked={store.view.selection.has(id)}
                                                    onChange={() => store.view.toggleSelection(id)}
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

