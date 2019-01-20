import * as React from 'react';
import { observer } from 'mobx-react';

import { IListItemData } from '../../../Controls/AddListItem';
import store from '../../../../stores/RootStore';
import SettingsDataList from '../SettingsDataList';
import { canAddClient, canEditClient } from '../../../../rules/rules';

@observer
export class ClientList extends React.Component {
    render() {
        const saveListItem = (data: IListItemData, id?: string) => {
            store.config.clientId = undefined;
            if (data.name) {
                store.config.clients.addAsync({ name: data.name, icon: data.icon }, id);
            }
        };
        return <SettingsDataList
            canAdd={canAddClient(store.user.currentUser)}
            canEdit={canEditClient(store.user.currentUser)}
            items={Array.from(store.config.clients.docs.values()).map(client => ({
                id: client.id,
                name: client.data!.name,
                isSelected: client.id === store.config.clientId
            }))}
            onSave={saveListItem}
            onSelect={(id) => store.config.clientId = id}
            labels={{ add: "Add client" }}
        ></SettingsDataList>;
    }
}