import React from "react";
import { observer } from "mobx-react-lite";

import { useViewStore } from "../../../contexts/view-context";
import { useDivisionStore } from "../../../contexts/division-context";
import { SettingsList } from "../../../components/settings-list";
import { goToDivision } from "../../../routes/divisions/detail";
import { useRouterStore } from "../../../stores/router-store";

export const DivisionUserList = observer(() => {
    const view = useViewStore();
    const division = useDivisionStore();
    const router = useRouterStore();

    const CurrentDivisions = observer(() => {
        return division.userDivisions.length
            ? (
                <>
                    <p>
                        You have joined the following divisions:
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
                            const divisionId = division.userDivisions.find(
                                userDivision => userDivision.divisionUserId === id
                            )?.id;

                            if (divisionId) {
                                goToDivision(router, divisionId);
                            }
                        }
                        }
                    />
                </>
            )
            : (
                <p>
                    You aren't in any division yet.
                    <br /><br /><br />
                </p>
            )
    });

    return (
        <>
            <CurrentDivisions />
        </>
    );
});
DivisionUserList.displayName = "DivisionUserList";