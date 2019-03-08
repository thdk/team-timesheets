import * as React from "react";
import { when } from "mobx";
import { observer } from "mobx-react";

import store from "../../../../stores/RootStore";
import { ListItem, List } from "../../../../mdc/list";
import { canReadUsers } from "../../../../rules/rules";
import { goToUser } from "../../../../routes/users/detail";
import { IRoles } from "../../../../../common";

export interface IUserListProps {

}

@observer
export class UserList extends React.Component<IUserListProps> {
    render() {
        if (!store.user.users.docs.size) return <></>;

        const userItems = Array.from(store.user.users.docs.entries()).map(([id, doc]) => {
            const { name, roles, team } = doc.data!;

            const teamData = team ? store.config.teamsCollection.docs.get(team) : undefined;
            const {name: teamName = "Archived"} = teamData ? teamData.data || {} : {};

            const activeRoles = (Object.keys(roles) as (keyof IRoles)[]).filter(r => !!roles[r]);

            return <ListItem
                key={id}
                icon={"person_outline"}
                onClick={this.userClick.bind(this, id)}
                lines={[name, (teamData ? `${teamName} - ` : '') + this.capitalizeFirstLetter(activeRoles.join(', '))]}></ListItem>
        });
        return (
            <List isTwoLine={true}>
                {userItems}
            </List>
        );
    }

    userClick(id: string) {
        goToUser(id);
    }

    componentDidMount() {
        if (!store.user.users.docs.size) {
            when(() => canReadUsers(store.user.authenticatedUser)).then(() => {
                store.user.users.getDocs();
            });
        }
    }

    private capitalizeFirstLetter(input: string) {
        return input && input.charAt(0).toUpperCase() + input.slice(1);
    }
}