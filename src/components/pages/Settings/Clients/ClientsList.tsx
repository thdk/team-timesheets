import * as React from 'react';
import { observer } from 'mobx-react';

import { IListItemData } from '../../../Controls/AddListItem';
import store from '../../../../stores/RootStore';
import { canWriteClient } from '../../../../rules/rules';
import { SettingsList } from '../../../Controls/SettingsList/SettingsList';

export const ClientList = observer(() => {
    const saveListItem = (data: IListItemData, id?: string) => {
        store.config.clientId = undefined;
        if (data.name) {
            if (id) {
                store.config.clientsCollection.addAsync({ name: data.name, icon: data.icon }, id);
            }
            else {
                store.config.clientsCollection.updateAsync(id, { name: data.name, icon: data.icon });
            }
        }
    };

    return <SettingsList
        readonly={!canWriteClient(store.user.authenticatedUser)}
        items={Array.from(store.config.clientsCollection.docs.values()).map(client => ({
            id: client.id,
            name: client.data!.name,
            icon: client.data!.icon
        }))}
        addItem={saveListItem}
        toggleSelection={id => id && store.view.toggleSelection(id, true)}
        onItemClick={id => store.config.clientId = id}
        activeItemId={store.config.clientId}
        selection={store.view.selection}
    ></SettingsList>
});