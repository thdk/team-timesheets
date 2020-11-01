import React, { useEffect } from "react";
import { transaction } from "mobx";

import { useViewStore } from "../../contexts/view-context";
import { useUserStore } from "../../contexts/user-context";
import { Box } from "../../components/layout/box";
import { DivisionUserList } from "../../containers/division-users/list";
import { queue as snackbarQueue } from "../../components/snackbar";
import { queue as dialogQueue } from "../../components/dialog-queue";

import { useDivisionStore } from "../../contexts/division-context";
import "./division-tab-content.css";

export const DivisionsTabContent = () => {
    const view = useViewStore();
    const user = useUserStore();
    const divisionStore = useDivisionStore();

    useEffect(() => {
        view.setActions([
            // leave division
            {
                action: (selection) => {
                    transaction(async () => {
                        let isLeavingActiveDivision = false;
                        const ids = [...(selection?.keys() || [])]
                            .filter(id => {
                                if (id === user.authenticatedUser?.divisionUserId) {
                                    isLeavingActiveDivision = true;
                                    return false;
                                }

                                return true;
                            });

                        if (isLeavingActiveDivision) {
                            snackbarQueue.notify({
                                title: "You can't leave your active division."
                            });
                        }
                        await user.divisionUsersCollection.updateAsync(null, ...ids);

                    })
                    view.selection.clear();
                },
                icon: {
                    content: "person_remove",
                    label: "Leave division"
                },
                contextual: true,
                selection: view.selection,
            },
            // join division
            {
                action: () => {
                    dialogQueue.prompt({
                        title: 'Join a division',
                        body: 'Enter the division entry code',
                        acceptLabel: 'Join',
                        cancelLabel: 'Cancel',
                        inputProps: {
                            outlined: true
                        },
                    }).then((code) => {
                        if (code) {
                            divisionStore.joinDivision(
                                code,
                            ).then(
                                (successMessage) => {
                                    return successMessage;
                                },
                                (errorMessage) => {
                                    return errorMessage;
                                }
                            )
                                .then((result) => {
                                    snackbarQueue.notify({
                                        title: result,
                                    });
                                });
                        }
                    });
                },
                icon: {
                    content: "person_add",
                    label: "Join a division",
                }
            }
        ])
    }, [view]);

    return (
        <Box className="division-tab-content">
            <DivisionUserList />
        </Box>
    );
}