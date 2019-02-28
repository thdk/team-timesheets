import * as React from "react";
import { when } from "mobx";
import { observer } from "mobx-react";

import store from "../../../../stores/RootStore";
import { ListItem, List } from "../../../../mdc/list";
import { canReadUsers } from "../../../../rules/rules";
import { goToUser } from "../../../../routes/users/detail";

export interface IUserListProps {

}

@observer
export class UserList extends React.Component<IUserListProps> {
    render() {
        if (!store.user.users.docs.size) return <></>;

        const userItems = Array.from(store.user.users.docs.entries()).map(([id, doc]) => {
            return <ListItem
                key={id}
                icon={"person_outline"}
                onClick={this.userClick.bind(this, id)}
                lines={[doc.data!.name]}></ListItem>
        });
        return (
            <List>
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
}