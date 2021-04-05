import React, { useCallback } from "react";
import { observer } from "mobx-react-lite";

import { FavoriteGroupDetailForm as PureFavoriteGroupDetailForm } from "./favorite-group-detail";
import { useFavoriteGroupStore } from "../../../contexts/favorite-context/favorite-context";

export const FavoriteGroupDetailForm = (
    observer(
        () => {
            const favoriteGroupStore = useFavoriteGroupStore();

            const handleNameChanged = useCallback(
                (name: string) => {
                    if (favoriteGroupStore.activeDocument) {
                        favoriteGroupStore.activeDocument.name = name;
                    }
                },
                [favoriteGroupStore]
            );

            return favoriteGroupStore.activeDocument && favoriteGroupStore.activeDocumentId
                ? (
                    <PureFavoriteGroupDetailForm
                        onNameChanged={handleNameChanged}
                        group={{ ...favoriteGroupStore.activeDocument, id: favoriteGroupStore.activeDocumentId }}
                        groups={favoriteGroupStore.groups}
                    />
                )
                : null;
        })
);
