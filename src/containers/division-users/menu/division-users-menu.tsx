import React, { useCallback, useState } from "react";
import { MenuSurfaceAnchor, MenuItem, MenuHTMLProps, MenuSurface } from "@rmwc/menu";
import { ListItem, List, ListDivider, ListItemGraphic, ListItemText } from "@rmwc/list";
import { observer } from "mobx-react-lite";

import { useDivisionStore } from "../../../contexts/division-context";
import { useRouterStore } from "../../../stores/router-store";
import { goToUserProfile } from "../../../internal";
import { useUserStore } from "../../../contexts/user-context";
import { AccountBadge } from "../../../components/account-badge";
import { IDivision } from "../../../../common/interfaces/IOrganisation";

import "./division-users-menu.css";

export const DivisionUsersMenu = observer(({
    children,
    ...menuProps
}: MenuHTMLProps
) => {
    const division = useDivisionStore();
    const router = useRouterStore();
    const user = useUserStore();

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleSelect = useCallback((selectedDivision: (IDivision & { divisionUserId: string }) | undefined) => {
        setIsMenuOpen(false);
        user.updateAuthenticatedUser({
            divisionUserId: selectedDivision?.divisionUserId,
            divisionId: selectedDivision?.id,
        });
    }, [goToUserProfile, user, division]);

    const handleAccountOnClick = useCallback(() => {
        if (division.userDivisions.length > 1) {
            setIsMenuOpen(!isMenuOpen);
        }
        else {
            goToUserProfile(router);
        }
    }, [router, division, setIsMenuOpen, goToUserProfile]);

    const displayName = division.division || user.authenticatedUser?.divisionId
        ? (
            division.division
                ? division.division.data!.name
                : ""
        )
        : (
            user.divisionUser
                ? user.divisionUser.name || "Guest"
                : ""
        );

    const email = user.divisionUser
        ? user.divisionUser.email || "unknown@timesheets.com"
        : "";

    return (
        <MenuSurfaceAnchor>
            <MenuSurface
                anchorCorner={"bottomStart"}
                open={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                className={"division-users-menu"}
                {...menuProps}
            >
                <List>
                    {division.userDivisions.map(division => <ListItem
                        role="menuitem"
                        tabIndex={0}
                        key={division.divisionUserId}
                        onClick={() => handleSelect(division)}
                    >
                        <ListItemGraphic icon={division.icon} />
                        <ListItemText>
                            {division.name}
                        </ListItemText>
                    </ListItem>)}
                    <ListDivider />
                    <ListItem
                        onClick={() => handleSelect(undefined)}>
                        <ListItemGraphic
                            icon={"all_inclusive"}
                        />
                        <ListItemText>
                            Default
                        </ListItemText>
                    </ListItem>
                </List>
                <ListDivider />
                <List>
                    <MenuItem
                        onClick={() => {
                            setIsMenuOpen(false);
                            goToUserProfile(router);
                        }}
                    >
                        Manage divisions
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            setIsMenuOpen(false);
                            goToUserProfile(router);
                        }}
                    >
                        Preferences
                    </MenuItem>
                </List>

            </MenuSurface>
            <AccountBadge
                email={email}
                name={displayName}
                onClick={handleAccountOnClick}
            />
        </MenuSurfaceAnchor>
    )
});
