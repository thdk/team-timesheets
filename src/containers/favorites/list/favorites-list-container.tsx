import React from "react";
import { observer } from "mobx-react-lite";

import { useStore } from "../../../contexts/store-context";
import { withFavorites } from "../with-favorites";
import { FavoritesList as PureFavoritesList } from "./favorites-list";

export const FavoritesList = observer(() => {
    const { favorites } = useStore();

    const FavoritesInGroup = withFavorites(PureFavoritesList);

    const activeDocumentId = favorites.activeDocumentId;
    return activeDocumentId
        ? <FavoritesInGroup groupId={activeDocumentId} />
        : null;
});