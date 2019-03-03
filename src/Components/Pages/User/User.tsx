import * as React from "react";
import store from "../../../stores/RootStore";
import { Box } from "../../Layout/box";
import { FlexGroup } from "../../Layout/flex";
import { FormField } from "../../Layout/form";
import { TextField } from "../../../mdc/textfield";
import { observer } from "mobx-react";
import Switch from "../../../mdc/switch";
import { IRoles } from "../../../../common";

@observer
export default class User extends React.Component {
    render() {
        if (!store.user.selectedUser) return <></>;
        const roles: (keyof IRoles)[] = ["admin", "editor", "user"] ;

        const userRoles = roles
            .map((role, i: number) =>
            <FormField key={role} first={i === 0}>
                <FlexGroup>
                    <Switch style={{ marginRight: '1em' }} onChange={this.onUserRoleChange.bind(this, role)} checked={!!store.user.selectedUser!.roles[role]} label={role}></Switch>
                </FlexGroup>
            </FormField>
        );

        return (
            <Box>
                <FlexGroup>
                    <FormField>
                        <TextField outlined={true} id="username" hint="Display name" value={store.user.selectedUser.name}
                            onChange={this.onUserNameChange}></TextField>
                    </FormField>
                </FlexGroup>

                <h3 className="mdc-typography--subtitle1">User security roles:</h3>

                <FlexGroup>
                    {userRoles}
                </FlexGroup>
            </Box>
        );
    }

    onUserNameChange(name: string) {
        store.user.updateSelectedUser({ name });
    }

    onUserRoleChange(role: keyof IRoles) {
        if (!store.user.selectedUser) return;
        const roles = { ...store.user.selectedUser.roles };
        roles[role] = !roles[role];
        store.user.updateSelectedUser({ roles });
    }
}