import React, { ReactNode } from "react";
import { observer } from "mobx-react-lite";

import { useViewStore } from "../../../contexts/view-context";
import { useDivisionStore } from "../../../contexts/division-context";
import { SettingsList } from "../../../components/settings-list";
import { goToDivision } from "../../../routes/divisions/detail";
import { useRouterStore } from "../../../stores/router-store";
import { withAuthentication } from "../../users/with-authentication";

export const DivisionUserList = withAuthentication(
    observer(
        ({
            placeholder,
        }: {
            placeholder?: ReactNode
        }
        ) => {
            const view = useViewStore();
            const division = useDivisionStore();
            const router = useRouterStore();

            if (!division.collection.isFetched) {
                return null;
            }

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
                    <>
                        {placeholder}
                    </>
                );
        },
    ),
);
DivisionUserList.displayName = "DivisionUserList";