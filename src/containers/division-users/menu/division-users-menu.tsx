import React, { useCallback, useState } from "react";
import { MenuSurfaceAnchor, MenuHTMLProps, MenuSurface } from "@rmwc/menu";
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
import { useAuthStore } from "../../../contexts/auth-context";

export const DivisionUsersMenu = observer(({
    children,
    onAction,
    ...menuProps
}: MenuHTMLProps & {
    onAction?(): void;
}
) => {
    const division = useDivisionStore();
    const router = useRouterStore();
    const user = useUserStore();
    const auth = useAuthStore();
    const configs = useConfigs();

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleSelect = useCallback((selectedDivision: (IDivision & { divisionUserId: string }) | undefined) => {
        setIsMenuOpen(false);
        auth.updateActiveDocument({
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

    const areDivisionsEnabled = configs.getConfigValue("enable-divisions", false) || true;

    const name = division.division || user.authenticatedUser?.divisionId
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
                            <List
                                onAction={onAction}
                            >
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
                                        {user.authenticatedUser?.name}
                                    </ListItemText>
                                </ListItem>
                            </List>
                            <ListDivider />
                        </>
                    )
                    : null}
                <List
                    onAction={onAction}
                >
                    <ListItem
                        onClick={() => {
                            setIsMenuOpen(false);
                            goToUserProfile(router, "preferences");
                        }}
                    >
                        Preferences
                    </ListItem>
                    {areDivisionsEnabled
                        ? (
                            <ListItem
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    goToUserProfile(router, "divisions");
                                }}
                            >
                                Manage divisions
                            </ListItem>
                        )
                        : null
                    }
                    <ListDivider />
                    <ListItem
                        onClick={() => {
                            setIsMenuOpen(false);
                            user.authenticatedUser ? auth.signout() : goToLogin(router);
                        }}
                    >
                        <ListItemGraphic
                            icon={"perm_identity"}
                        />
                        <ListItemText>
                            Logout
                        </ListItemText>
                    </ListItem>
                </List>

            </MenuSurface>
            <AccountBadge
                email={email}
                name={name}
                onClick={handleAccountOnClick}
                meta={<Icon icon="expand_more" />}
            />
        </MenuSurfaceAnchor>
    )
});
