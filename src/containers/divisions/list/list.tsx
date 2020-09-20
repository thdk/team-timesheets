import React, { useCallback } from "react";
import { useUserStore } from "../../../contexts/user-context";
import { SettingsList } from "../../../components/settings-list";
import { useViewStore } from "../../../contexts/view-context";
import { observer } from "mobx-react-lite";
import { DivisionJoinform } from "../join-form";
import { INameWithIcon } from "../../../../common";
import { useDivisionStore } from "../../../contexts/division-context";
import { v4 as uuidv4 } from 'uuid';

export const DivisionsList = observer(() => {
    const user = useUserStore();
    const view = useViewStore();
    const division = useDivisionStore();

    const handleOnAddClick = useCallback(async ({
        icon,
        name,
    }: INameWithIcon) => {
        const divisionId = uuidv4();

        await division.organisationsCollection.addAsync({
            name,
            icon,
            createdBy: user.authenticatedUserId!,
            id: divisionId,
        }, divisionId);

        user.usersCollection.addAsync([{
            ...user.authenticatedUser!,
            divisionId,
            roles: {
                admin: true
            }
        }]);
    }, [user, division]);

    return (
        <>
            <DivisionJoinform />
            <p>
                or create your own division and start recruiting or go solo!
            </p>
            <SettingsList
                items={division.userDivisions}
                onToggleSelection={() => { }}
                selection={view.selection}
                onAddItem={handleOnAddClick}
                onItemClick={(id) => { user.updateDivisionUser({ divisionId: id }); }}
                addLabel={"Start a new division"}
            />
        </>
    );
});
DivisionsList.displayName = "DivisionsList";