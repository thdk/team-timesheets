import * as React from "react";
import { observer } from "mobx-react-lite";

import { canManageTeams } from "../../../rules";
import { SettingsList, IListItemData } from "../../../components/settings-list";
import { useUserStore } from "../../../contexts/user-context";
import { useConfigStore } from "../../../stores/config-store";
import { useViewStore } from "../../../contexts/view-context";

export const TeamList = observer(() => {
    const config = useConfigStore();
    const view = useViewStore();
    const user = useUserStore();

    const saveListItem = (data: IListItemData, id?: string) => {
        config.teamId = undefined;
        if (data.name) {
            config.teamsCollection.addAsync({
                name: data.name,
                icon: data.icon,
                divisionId: user.divisionUser?.divisionId,
            },
                id,
            );
        }
    };

    return <SettingsList
        readonly={!canManageTeams(user.divisionUser)}
        items={Array.from(config.teamsCollection.docs.values()).map(team => ({
            id: team.id,
            name: team.data!.name,
            icon: team.data!.icon
        }))}
        onAddItem={saveListItem}
        onToggleSelection={id => id && view.toggleSelection(id)}
        onItemClick={id => config.teamId = id}
        activeItemId={config.teamId}
        selection={view.selection}
    ></SettingsList>;
});