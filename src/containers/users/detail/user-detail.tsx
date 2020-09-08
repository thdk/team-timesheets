import React from "react";

import { useUserStore } from "../../../contexts/user-context";
import { IRoles } from "../../../../common";
import { FormField } from "../../../components/layout/form";
import { FlexGroup } from "../../../components/layout/flex";
import { Switch } from "@rmwc/switch";
import { Box } from "../../../components/layout/box";
import { TextField } from "@rmwc/textfield";
import { TeamSelect } from "../../teams/select";
import { observer } from "mobx-react-lite";

export const UserDetail = observer(() => {
    const user = useUserStore();

    if (!user.selectedUser) return <></>;

    const roles: (keyof IRoles)[] = ["admin", "editor", "user"];
    const { name, roles: userRoles, team } = user.selectedUser;

    const onUserNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        user.updateSelectedUser({ name: event.currentTarget.value });
    }

    const onUserRoleChange = (role: keyof IRoles) => {
        const roles = userRoles;
        roles[role] = !roles[role];
        user.updateSelectedUser({ roles });
    }

    const onTeamChange = (value: string) => {
        user.updateSelectedUser({ team: value });
    }

    const userRolesEls = roles
        .map((role, i: number) =>
            <FormField key={role} first={i === 0}>
                <FlexGroup>
                    <Switch
                        style={{ marginRight: '1em' }}
                        onChange={() => onUserRoleChange(role)}
                        checked={!!userRoles[role]} label={role}
                    />
                </FlexGroup>
            </FormField>
        );

    return (
        <Box>
            <FlexGroup>
                <FormField>
                    <TextField
                        outlined={true}
                        id="username"
                        placeholder="Display name"
                        value={name}
                        onChange={onUserNameChange}
                    />
                </FormField>
                <TeamSelect
                    value={team}
                    onChange={onTeamChange}
                />
            </FlexGroup>

            <h3 className="mdc-typography--subtitle1">
                User security roles:
            </h3>

            <FlexGroup>
                {userRolesEls}
            </FlexGroup>
        </Box>
    );
});