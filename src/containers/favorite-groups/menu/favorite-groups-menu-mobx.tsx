import * as React from "react";
import { observer } from "mobx-react-lite";
import { FavoriteGroupsMenuProps, FavoriteGroupsMenu } from "./favorite-groups-menu";
import { useStore } from "../../../contexts/store-context";

const FavoriteGroupsMenuMobx = (props: Omit<FavoriteGroupsMenuProps, "groups">) => {
    const store = useStore();

    const groups = store.favorites.groups;

    return <FavoriteGroupsMenu
        groups={groups} {...props}></FavoriteGroupsMenu>
}

export default observer(FavoriteGroupsMenuMobx);
