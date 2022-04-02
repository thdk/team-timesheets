import * as React from "react";
import { observer } from "mobx-react-lite";
import { FavoriteGroupsMenuProps, FavoriteGroupsMenu } from "./favorite-groups-menu";
import { useFavoriteGroupStore } from "../../../contexts/favorite-context";

const FavoriteGroupsMenuMobx = (props: Omit<FavoriteGroupsMenuProps, "groups">) => {
    const favorites = useFavoriteGroupStore();

    return (
        <FavoriteGroupsMenu
            groups={favorites.groups} {...props}
        />
    );
}

export default observer(FavoriteGroupsMenuMobx);
