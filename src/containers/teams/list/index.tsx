import * as React from "react";
import { observer } from "mobx-react-lite";

import store from "../../../stores/root-store";
import { canManageTeams } from "../../../rules/rules";
import { SettingsList, IListItemData } from "../../../components/settings-list";

export const TeamList = observer(() => {

    const saveListItem = (data: IListItemData, id?: string) => {
        store.config.teamId = undefined;
        if (data.name) {
            store.config.teamsCollection.addAsync({ name: data.name, icon: data.icon }, id);
        }
    };

    return <SettingsList
        readonly={!canManageTeams(store.user.authenticatedUser)}
        items={Array.from(store.config.teamsCollection.docs.values()).map(team => ({
            id: team.id,
            name: team.data!.name,
            icon: team.data!.icon
        }))}
        onAddItem={saveListItem}
        onToggleSelection={id => id && store.view.toggleSelection(id, true)}
        onItemClick={id => store.config.teamId = id}
        activeItemId={store.config.teamId}
        selection={store.view.selection}
    ></SettingsList>;
});