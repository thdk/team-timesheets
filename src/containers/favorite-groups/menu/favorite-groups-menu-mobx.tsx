import * as React from "react";
import { FavoriteGroupsMenuProps, FavoriteGroupsMenu } from "./favorite-groups-menu";
import { observer } from "mobx-react-lite";
import { StoreContext } from "../../../contexts/store-context";

const FavoriteGroupsMenuMobx = (props: Omit<FavoriteGroupsMenuProps, "groups">) => {
    const store = React.useContext(StoreContext);

    const groups = store.favorites.groups;

    return <FavoriteGroupsMenu
        groups={groups} {...props}></FavoriteGroupsMenu>
}

export default observer(FavoriteGroupsMenuMobx);
