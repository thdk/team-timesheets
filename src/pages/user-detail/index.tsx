import * as React from "react";
import store from "../../stores/root-store";
import { Box } from "../../components/layout/box";
import { FlexGroup } from "../../components/layout/flex";
import { FormField } from "../../components/layout/form";
import { observer } from "mobx-react";
import Switch from "../../mdc/switch";
import { IRoles } from "../../../common";
import TeamSelect from "../../containers/teams/select";
import { withAuthentication } from "../../containers/users/with-authentication";
import { RedirectToLogin } from "../../routes/login";
import { TextField } from "@rmwc/textfield";

@observer
class User extends React.Component {
    render() {
        if (!store.user.selectedUser) return <></>;

        const roles: (keyof IRoles)[] = ["admin", "editor", "user"];

        const { name, roles: userRoles, team } = store.user.selectedUser;

        const userRolesEls = roles
            .map((role, i: number) =>
                <FormField key={role} first={i === 0}>
                    <FlexGroup>
                        <Switch style={{ marginRight: '1em' }} onChange={this.onUserRoleChange.bind(this, role)} checked={!!userRoles[role]} label={role}></Switch>
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
                            onChange={this.onUserNameChange}
                        />
                    </FormField>
                    <TeamSelect value={team} onChange={this.onTeamChange}></TeamSelect>
                </FlexGroup>

                <h3 className="mdc-typography--subtitle1">User security roles:</h3>

                <FlexGroup>
                    {userRolesEls}
                </FlexGroup>
            </Box>
        );
    }

    onUserNameChange(event: React.ChangeEvent<HTMLInputElement>) {
        store.user.updateSelectedUser({ name: event.currentTarget.value });
    }

    onUserRoleChange(role: keyof IRoles) {
        if (!store.user.selectedUser) return;
        const roles = { ...store.user.selectedUser.roles };
        roles[role] = !roles[role];
        store.user.updateSelectedUser({ roles });
    }

    onTeamChange = (value: string) => {
        if (store.user.selectedUser)
            store.user.updateSelectedUser({ team: value });
    }
}

export default withAuthentication(
    User,
    <RedirectToLogin />,
);
