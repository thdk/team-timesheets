import * as React from "react";
import { observer } from "mobx-react";

import { ListItem, List } from "../../../mdc/list";
import { goToUser } from "../../../routes/users/detail";
import { IRoles, IUser } from "../../../../common";
import { withUsers } from "../with-users";
import { StoreContext } from "../../../contexts/store-context";

export interface IUserListProps {
    users: (IUser & {id:string})[];
}

@observer
class UserList extends React.Component<IUserListProps> {
    declare context: React.ContextType<typeof StoreContext>
    static contextType = StoreContext;

    render() {

        const userItems = this.props.users.map(data => {
            const { name, roles, team, id } = data;

            const teamData = team ? this.context.config.teamsCollection.get(team) : undefined;
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
        goToUser(this.context, id);
    }

    private capitalizeFirstLetter(input: string) {
        return input && input.charAt(0).toUpperCase() + input.slice(1);
    }
}

export default withUsers(UserList);
