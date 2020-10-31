import * as React from 'react';
import { observer } from 'mobx-react-lite';


import { canWriteClient } from '../../../rules';
import { SettingsList, IListItemData } from '../../../components/settings-list';
import { useConfigStore } from '../../../stores/config-store';
import { useUserStore } from '../../../contexts/user-context';
import { useViewStore } from '../../../contexts/view-context';

export const ClientList = observer(() => {
    const user = useUserStore();
    const config = useConfigStore();
    const view = useViewStore();

    const saveListItem = (data: IListItemData, id?: string) => {
        config.clientId = undefined;
        if (data.name) {
            config.clientsCollection.addAsync({
                name: data.name,
                icon: data.icon,
                divisionId: user.divisionUser?.divisionId,
            },
                id,
            );
        }
    };

    return <SettingsList
        readonly={!canWriteClient(user.divisionUser)}
        items={Array.from(config.clientsCollection.docs.values()).map(client => ({
            id: client.id,
            name: client.data!.name,
            icon: client.data!.icon,
        }))}
        onAddItem={saveListItem}
        onToggleSelection={id => id && view.toggleSelection(id)}
        onItemClick={id => config.clientId = id}
        activeItemId={config.clientId}
        selection={view.selection}
    ></SettingsList>
});