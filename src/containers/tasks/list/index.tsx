import * as React from 'react';
import { observer } from 'mobx-react-lite';

import store from '../../../stores/root-store';
import { canEditTask, canDeleteTask, canManageTasks } from '../../../rules/rules';
import { SettingsList, IListItemData } from '../../../components/settings-list';

export const TaskList = observer((props: React.HTMLProps<HTMLDivElement>) => {

    const selectItem = (id: string | undefined) => {
        if (canEditTask(store.user.authenticatedUser) || canDeleteTask(store.user.authenticatedUser)) {
            store.config.taskId = id;
        }
    }

    const saveListItem = (data: IListItemData, id?: string) => {
        store.config.taskId = undefined;
        if (data.name) {
            store.config.tasks.addAsync({ name: data.name, icon: data.icon }, id);
        }
    }

    return <SettingsList {...props}
        readonly={!canManageTasks(store.user.authenticatedUser)}
        items={Array.from(store.config.tasks.docs.values()).map(task => ({ ...task.data!, id: task.id }))}
        onAddItem={saveListItem}
        onToggleSelection={id => store.view.toggleSelection(id, true)}
        onItemClick={selectItem}
        selection={store.view.selection}
        activeItemId={store.config.taskId}
    ></SettingsList>;
});

