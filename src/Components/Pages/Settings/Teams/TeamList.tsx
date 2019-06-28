import * as React from "react";
import { observer } from "mobx-react";

import store from "../../../../stores/RootStore";
import { IListItemData } from "../../../Controls/AddListItem";
import SettingsDataList from "../SettingsDataList";
import { canAddTeam, canEditTeam } from "../../../../rules/rules";

export interface ITeamListProps {

}

@observer
export class TeamList extends React.Component<ITeamListProps> {
    render() {
        const saveListItem = (data: IListItemData, id?: string) => {
            store.config.teamId = undefined;
            if (data.name) {
                store.config.teamsCollection.addAsync({ name: data.name, icon: data.icon }, id);
            }
        };
        return <SettingsDataList
            canAdd={canAddTeam(store.user.authenticatedUser)}
            canEdit={canEditTeam(store.user.authenticatedUser)}
            items={store.config.teams}
            onSave={saveListItem}
            onSelect={id => store.config.teamId = id}
            labels={{ add: "Add team" }}
        ></SettingsDataList>;
    }
}