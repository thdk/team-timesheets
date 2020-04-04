import * as React from 'react';
import { observer } from 'mobx-react';


import { canWriteClient } from '../../../rules/rules';
import { SettingsList, IListItemData } from '../../../components/settings-list';
import { StoreContext } from '../../../contexts/store-context';

export const ClientList = observer(() => {
    const store = React.useContext(StoreContext);

    const saveListItem = (data: IListItemData, id?: string) => {
        store.config.clientId = undefined;
        if (data.name) {
                store.config.clientsCollection.addAsync({ name: data.name, icon: data.icon }, id);
        }
    };

    return <SettingsList
        readonly={!canWriteClient(store.user.authenticatedUser)}
        items={Array.from(store.config.clientsCollection.docs.values()).map(client => ({
            id: client.id,
            name: client.data!.name,
            icon: client.data!.icon
        }))}
        onAddItem={saveListItem}
        onToggleSelection={id => id && store.view.toggleSelection(id, true)}
        onItemClick={id => store.config.clientId = id}
        activeItemId={store.config.clientId}
        selection={store.view.selection}
    ></SettingsList>
});