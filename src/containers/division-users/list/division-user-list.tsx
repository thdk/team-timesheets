import React, { useCallback } from "react";
import { observer } from "mobx-react-lite";
import { v4 as uuidv4 } from 'uuid';
import cryptoRandomString from 'crypto-random-string';
import copy from "copy-text-to-clipboard";

import { useUserStore } from "../../../contexts/user-context";
import { useViewStore } from "../../../contexts/view-context";
import { useDivisionStore } from "../../../contexts/division-context";
import { SettingsList } from "../../../components/settings-list";
import { INameWithIcon } from "../../../../common";
import { queue } from "../../../components/snackbar";

export const DivisionUserList = observer(() => {
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

    const CurrentDivisions = observer(() => {
        return division.userDivisions.length
            ? (
                <>
                    <p>
                        You're in the following divisions
                </p>
                    <SettingsList
                        items={division.userDivisions.map(userDivision => ({
                            id: userDivision.divisionUserId,
                            name: userDivision.name,
                            icon: userDivision.icon,
                        }))}
                        onToggleSelection={view.toggleSelection.bind(view)}
                        selection={view.selection}
                        onItemClick={(id) => {

                            const divisionId = division.userDivisions.find(userDivision => userDivision.id === id)?.divisionId;
                            division.divisionCodesCollection.query = ref => ref.where("divisionId", "==", divisionId);
                            division.divisionCodesCollection.fetchAsync()
                                .then(() => {
                                    division.divisionCodesCollection.docs.forEach(d => {
                                        queue.notify({
                                            title: `Division entry code: ${d.data!.code}`,
                                            dismissesOnAction: true,
                                            actions: [
                                                {
                                                    label: 'Copy',
                                                    icon: 'content_copy',
                                                    onClick: () => {
                                                        copy(d.data!.code);
                                                    },
                                                },
                                            ],
                                        });
                                    })
                                });
                        }
                        }
                    />
                </>
            )
            : (
                <p>
                    You aren't in any division yet.
                </p>
            )
    });

    return (
        <>
            <CurrentDivisions />
            <p>
                or create your own division and start recruiting or go solo!
            </p>
            <SettingsList
                items={[]}
                onAddItem={handleOnAddClick}
                addLabel={"Start a new division"}
                selection={view.selection}
                onToggleSelection={() => { }}
            />
        </>
    );
});
DivisionUserList.displayName = "DivisionUserList";