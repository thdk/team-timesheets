import React, { useEffect } from "react";
import { transaction } from "mobx";

import { useViewStore } from "../../contexts/view-context";
import { useUserStore } from "../../contexts/user-context";
import { Box } from "../../components/layout/box";
import { DivisionJoinform } from "../../containers/division-users/join-form";
import { DivisionsList } from "../../containers/division-users/list";
import { queue } from "../../components/snackbar";

import "./division-tab-content.css";

export const DivisionsTabContent = () => {
    const view = useViewStore();
    const user = useUserStore();

    useEffect(() => {
        view.setActions([
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
                            queue.notify({
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
        ])
    }, [view]);

    return (
        <Box className="division-tab-content">
            <div className="division-tab-content__left">
                <DivisionJoinform />
            </div>
            <div className="division-tab-content__right">
                <DivisionsList />
            </div>
        </Box>
    );
}