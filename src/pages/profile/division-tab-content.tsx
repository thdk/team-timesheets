import React, { useEffect } from "react";
import { transaction } from "mobx";

import { useViewStore } from "../../contexts/view-context";
import { useUserStore } from "../../contexts/user-context";
import { Box } from "../../components/layout/box";
import { DivisionUserList } from "../../containers/division-users/list";
import { queue as snackbarQueue } from "../../components/snackbar";
import { queue as dialogQueue } from "../../components/dialog-queue";

import { useDivisionStore } from "../../contexts/division-context";
import { goToDivision } from "../../routes/divisions/detail";
import { useRouterStore } from "../../stores/router-store";

import "./division-tab-content.css";
import { useCallback } from "react";

export const DivisionsTabContent = () => {
    const view = useViewStore();
    const user = useUserStore();
    const divisionStore = useDivisionStore();
    const router = useRouterStore();

    const handleJoinDivision = useCallback(
        (e?: React.MouseEvent) => {
            e && e.preventDefault();
            dialogQueue.prompt({
                title: 'Join a division',
                body: 'Enter the division entry code',
                acceptLabel: 'Join',
                cancelLabel: 'Cancel',
                inputProps: {
                    outlined: true
                },
            }).then(
                (code) => {
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
                },
            )
        },
        [snackbarQueue, divisionStore]
    );

    const handleCreateNewClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        goToDivision(router)
    }, [goToDivision, router]);

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
        ]);

        view.setFabs([
            {
                icon: {
                    content: "person_add",
                    label: "Join division",
                },
                action: () => handleJoinDivision(),
            },
            {
                icon: {
                    content: "add",
                    label: "New division",
                },
                action: () => {
                    goToDivision(router);
                },
            },
        ]);

        return () => {
            view.setActions([]);
            view.setFabs([]);
        };
    }, [view, user, divisionStore]);

    return (
        <Box className="division-tab-content">
            <DivisionUserList
                placeholder={
                    <>
                        <p>
                            You aren't in any division yet.
                    </p>
                        <p>
                            <a href="#"
                                onClick={handleCreateNewClick}
                            >Create a new division</a>
                            <span> or </span>
                            <a href="#"
                                onClick={handleJoinDivision}
                            >join an existing division</a>.
                            <br /><br /><br />
                            <p>
                                A division is needed to start using Team Timesheets.
                                If your division grows, you can recruit more team members to your division.
                                <br/>
                                Items such as projects, clients, tasks and teams are shared within a division.

                                Nothing is shared with other divisons.
                            </p>
                        </p>
                    </>
                }
            />
        </Box>
    );
}