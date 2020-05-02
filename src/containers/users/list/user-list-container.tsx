import React, { useCallback } from "react";
import { UserList as PureUserList } from "./user-list";
import { useStore } from "../../../contexts/store-context";
import { IRoles } from "../../../../common";
import { observer } from "mobx-react-lite";
import routes from "../../../routes/users/detail";

export const UserList = observer(() => {
    const store = useStore();

    const onUserClick = useCallback((id: string) => {
        store.router.goTo(routes.registrationDetail, { id });
    }, [store]);

    const users = store.user.users.map(user => {
        const { roles, team } = user;

        const teamData = team ? store.config.teamsCollection.get(team) : undefined;
        const { name: teamName = undefined } = teamData ? teamData.data! : {};

        const activeRoles = (Object.keys(roles) as (keyof IRoles)[]).filter(r => !!roles[r]);

        return {
            ...user,
            roles: activeRoles,
            teamName: teamName
        };
    });

    return (
        <PureUserList
            onUserSelect={onUserClick}
            users={users}
        />
    )
});