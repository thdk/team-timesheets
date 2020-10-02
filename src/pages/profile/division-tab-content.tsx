import React, { useEffect } from "react";
import { useViewStore } from "../../contexts/view-context";
import { useUserStore } from "../../contexts/user-context";
import { Box } from "../../components/layout/box";
import { DivisionJoinform } from "../../containers/divisions/join-form";
import { DivisionsList } from "../../containers/divisions/list";

import "./division-tab-content.css";
import { useDivisionStore } from "../../contexts/division-context";
import { transaction } from "mobx";

export const DivisionsTabContent = () => {
    const view = useViewStore();
    const user = useUserStore();
    const division = useDivisionStore();

    useEffect(() => {
        view.setActions([
            {
                action: (selection) => {
                    transaction(async () => {
                        const ids = [...(selection?.keys() || [])];
                        await user.divisionUsersCollection.updateAsync(null, ...ids);
                        if (ids.some(id => id === user.authenticatedUser?.divisionUserId)) {
                            await user.updateAuthenticatedUser({
                                divisionUserId: undefined,
                            });
                        }

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
            {
                action: (selection) => {
                    if (selection?.size === 1) {
                        const divisionUserId = [...selection.keys()][0];
                        const divisionId = user.divisionUsersCollection.get(divisionUserId)?.data!.divisionId;
                        division.divisionCodesCollection.query = ref => ref.where("divisionId", "==", divisionId);
                        division.divisionCodesCollection.fetchAsync()
                            .then(() => {
                                console.log(division.divisionCodesCollection.docs.map(d => d.data!.code))
                            });
                    }
                },
                icon: {
                    content: "share",
                    label: "Share entry code",
                },
                contextual: true,
                selection: view.selection,
            }
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