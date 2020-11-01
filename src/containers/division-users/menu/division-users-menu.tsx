import React, { useCallback, useState } from "react";
import { MenuSurfaceAnchor, MenuItem, MenuHTMLProps, MenuSurface } from "@rmwc/menu";
import { ListItem, List, ListDivider, ListItemGraphic, ListItemText } from "@rmwc/list";
import { observer } from "mobx-react-lite";

import { useDivisionStore } from "../../../contexts/division-context";
import { useRouterStore } from "../../../stores/router-store";
import { goToUserProfile, goToLogin } from "../../../internal";
import { useUserStore } from "../../../contexts/user-context";
import { AccountBadge } from "../../../components/account-badge";
import { IDivision } from "../../../../common/interfaces/IOrganisation";

import "./division-users-menu.css";
import { Icon } from "@rmwc/icon";
import { useConfigs } from "../../configs/use-configs";

export const DivisionUsersMenu = observer(({
    children,
    ...menuProps
}: MenuHTMLProps
) => {
    const division = useDivisionStore();
    const router = useRouterStore();
    const user = useUserStore();
    const configs = useConfigs();

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleSelect = useCallback((selectedDivision: (IDivision & { divisionUserId: string }) | undefined) => {
        setIsMenuOpen(false);
        user.updateAuthenticatedUser({
            divisionUserId: selectedDivision?.divisionUserId,
            divisionId: selectedDivision?.id,
        });
    }, [goToUserProfile, user]);

    const handleAccountOnClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        setIsMenuOpen(true);
    }, []);

    const handleOnMenuClose = () => {
        setIsMenuOpen(false);
    };

    const areDivisionsEnabled = configs.getConfigValue("enable-divisions", false) || false;

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
                onClose={handleOnMenuClose}
                className={"division-users-menu"}
                {...menuProps}
            >
                {areDivisionsEnabled && division.userDivisions.length
                    ? (
                        <>
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
                        </>
                    )
                    : null}
                <List>
                    <MenuItem
                        onClick={() => {
                            setIsMenuOpen(false);
                            goToUserProfile(router, "preferences");
                        }}
                    >
                        Preferences
                    </MenuItem>
                    {areDivisionsEnabled
                        ? (
                            <MenuItem
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    goToUserProfile(router, "divisions");
                                }}
                            >
                                Manage divisions
                            </MenuItem>
                        )
                        : null
                    }
                    <ListDivider />
                    <MenuItem
                        onClick={() => {
                            user.authenticatedUser ? user.signout() : goToLogin(router);
                        }}
                    >
                        <ListItemGraphic
                            icon={"perm_identity"}
                        />
                        <ListItemText>
                            Logout
                        </ListItemText>
                    </MenuItem>
                </List>

            </MenuSurface>
            <AccountBadge
                email={email}
                name={displayName}
                onClick={handleAccountOnClick}
                meta={<Icon icon="expand_more" />}
            />
        </MenuSurfaceAnchor>
    )
});
