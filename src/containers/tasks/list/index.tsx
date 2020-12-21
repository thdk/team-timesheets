import * as React from 'react';
import { observer } from 'mobx-react-lite';

import { canEditTask, canDeleteTask, canManageTasks } from '../../../rules';
import { SettingsList } from '../../../components/settings-list';
import { useTasks } from '../../../contexts/task-context';
import { useUserStore } from "../../../contexts/user-context";
import { useViewStore } from '../../../contexts/view-context';
import { goToTask } from '../../../routes/tasks/detail';
import { useRouterStore } from '../../../stores/router-store';

export const TaskList = observer((props: React.HTMLProps<HTMLDivElement>) => {
    const { tasks, taskId } = useTasks();
    const view = useViewStore();
    const user = useUserStore();
    const router = useRouterStore();

    const handleItemClick = (id: string) => {
        if (canEditTask(user.divisionUser) || canDeleteTask(user.divisionUser)) {
            goToTask(router, id);
        }
    }

    return (
        <SettingsList {...props}
            readonly={!canManageTasks(user.divisionUser)}
            items={tasks}
            onToggleSelection={id => view.toggleSelection(id)}
            onItemClick={handleItemClick}
            selection={view.selection}
            activeItemId={taskId}
        />
    );
});

