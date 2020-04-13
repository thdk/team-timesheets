import * as React from 'react'
import { IFavoriteRegistration } from "../../../../common/dist";
import { useStore } from "../../../contexts/store-context";
import { useEffect } from 'react';
import { useState } from 'react';
import { Doc } from 'firestorable';

export interface IWithFavoritesInjectedProps {
    favorites: Doc<IFavoriteRegistration>[];
}

export function withFavorites(
    WrappedComponent: React.ComponentType<any>,
) {
    const ComponentWithFavorites = ({
        groupId,
    }: {
        groupId: string,
    }) => {
        const store = useStore();
        const [favorites, setFavorites] = useState<Doc<IFavoriteRegistration>[] | undefined>(undefined);

        useEffect(() => {
            store.favorites.getFavoritesByGroupIdAsync(groupId)
                .then(favorites => {
                    setFavorites(favorites);
                });
        }, []);

        if (favorites === undefined) return <></>;

        return favorites
            ? <WrappedComponent
                favorites={favorites}
            />
            : <></>;
    }

    return ComponentWithFavorites;
}
