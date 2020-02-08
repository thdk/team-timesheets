import * as React from "react";
import store from "../../../stores/root-store";
import { FavoriteGroupsMenuProps, FavoriteGroupsMenu } from "./favorite-groups-menu";
import { observer } from "mobx-react-lite";

const FavoriteGroupsMenuMobx = (props: Omit<FavoriteGroupsMenuProps, "groups">) => {
    const groups = store.favorites.groups;

    return <FavoriteGroupsMenu
        groups={groups} {...props}></FavoriteGroupsMenu>
}

export default observer(FavoriteGroupsMenuMobx);
