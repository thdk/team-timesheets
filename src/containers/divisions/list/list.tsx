import React, { useCallback } from "react";
import { observer } from "mobx-react-lite";
import { v4 as uuidv4 } from 'uuid';
import cryptoRandomString from 'crypto-random-string';

import { useUserStore } from "../../../contexts/user-context";
import { SettingsList } from "../../../components/settings-list";
import { useViewStore } from "../../../contexts/view-context";
import { INameWithIcon } from "../../../../common";
import { useDivisionStore } from "../../../contexts/division-context";

export const DivisionsList = observer(() => {
    const user = useUserStore();
    const view = useViewStore();
    const division = useDivisionStore();

    const handleOnAddClick = useCallback(async ({
        icon,
        name,
    }: INameWithIcon) => {
        const divisionId = uuidv4();
        const divisionUserId = uuidv4();

        await Promise.all([
            division.divisionCollection.addAsync({
                name,
                icon,
                createdBy: user.authenticatedUserId!,
                id: divisionId,
            }, divisionId),
            division.divisionCodesCollection.addAsync({
                code: cryptoRandomString({ length: 6, type: 'distinguishable' }),
                divisionId,
            }),
            user.divisionUsersCollection.addAsync(
                {
                    ...user.authenticatedUser!,
                    divisionId,
                    roles: {
                        admin: true
                    },
                },
                divisionUserId,
            ),
        ]);

        if (!user.authenticatedUser?.divisionUserId) {
            user.updateAuthenticatedUser({
                divisionUserId,
                divisionId,
            });
        }
    }, [user, division]);

    return (
        <>
            <p>
                or create your own division and start recruiting or go solo!
            </p>
            <SettingsList
                items={division.userDivisions}
                onToggleSelection={view.toggleSelection.bind(view)}
                selection={view.selection}
                onAddItem={handleOnAddClick}
                onItemClick={(id) => {
                    const divisionId = user.divisionUsersCollection.get(id)?.data!.divisionId;
                    user.updateAuthenticatedUser({
                        divisionUserId: id,
                        divisionId,
                    });
                }}
                addLabel={"Start a new division"}
            />
        </>
    );
});
DivisionsList.displayName = "DivisionsList";