import { IUser } from "../../../../common";
import { capitalizeFirstLetter } from "../../../utils/string";
import { ListItem, ListItemText, ListItemPrimaryText, ListItemSecondaryText, List, ListItemGraphic } from "@rmwc/list";
import React from "react";

export interface IUserListProps {
    users: (
        IUser
        & {
            id: string,
            teamName?: string;
            roles: string[];
        }
    )[],
    onUserSelect: (id: string) => void,
}

export const UserList = ({
    users,
    onUserSelect,
}: IUserListProps) => {

    const userItems = users.map(data => {
        const { name, roles, id, teamName } = data;
        return (
            <ListItem
                key={id}
                onClick={onUserSelect.bind(null, id)}
            >
                <ListItemGraphic icon="person_outline" />
                <ListItemText>
                    <ListItemPrimaryText>
                        {name}
                    </ListItemPrimaryText>
                    <ListItemSecondaryText>
                        {(teamName ? `${teamName} - ` : '') + capitalizeFirstLetter(roles.join(', '))}
                    </ListItemSecondaryText>
                </ListItemText>
            </ListItem>
        );
    });

    return (
        <List twoLine>
            {userItems}
        </List>
    );
};
