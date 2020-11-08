import React, { useCallback } from "react";
import { UserList as PureUserList } from "./user-list";
import { IRoles } from "../../../../common";
import { observer } from "mobx-react-lite";
import routes from "../../../routes/users/detail";
import { useUserStore } from "../../../contexts/user-context";
import { useRouterStore } from "../../../stores/router-store";
import { useConfigStore } from "../../../stores/config-store";

export const UserList = observer(() => {
    const user = useUserStore();
    const router = useRouterStore();
    const config = useConfigStore();

    const onUserClick = useCallback((id: string) => {
        router.goTo(routes.registrationDetail, { id });
    }, [router]);

    const users = user.users.map(user => {
        const { roles, team } = user;

        const teamData = team ? config.teamsCollection.get(team) : undefined;
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
