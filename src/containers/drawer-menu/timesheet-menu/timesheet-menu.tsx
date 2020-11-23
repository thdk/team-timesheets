import React from "react";
import { observer } from "mobx-react-lite";

import { withAuthorisation } from "../../users/with-authorisation";
import { useViewStore } from "../../../contexts/view-context";
import { useRouterStore } from "../../../stores/router-store";
import { goToQuickOverview, goToFavorites } from "../../../internal";
import { DrawerMenuGroup } from "../../drawer-menu-group";
import { canAddRegistrations } from "../../../rules";

export const TimesheetMenu = withAuthorisation(
    observer(() => {
        const view = useViewStore();
        const router = useRouterStore();

        return (
            <DrawerMenuGroup
                items={
                    [
                        {
                            action: () => goToQuickOverview({ view, router }),
                            text: "Today",
                            icon: "today",
                        },
                        {
                            action: () => goToQuickOverview({ view, router }, true),
                            text: "This month",
                            icon: "calendar_today",
                        },
                        {
                            action: () => goToFavorites(router),
                            text: "Favorites",
                            icon: "favorite",
                        }
                    ]
                }
            />
        );
    }),
    user => canAddRegistrations(user),
);