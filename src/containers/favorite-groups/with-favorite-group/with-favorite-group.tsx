import * as React from 'react'
import { IFavoriteRegistrationGroup, IFavoriteRegistration } from "../../../../common/dist";
import { observer } from "mobx-react-lite";
import { Doc } from "firestorable";
import { StoreContext } from "../../../contexts/store-context";

export interface IWithFavoriteGroupInjectedProps {
    group: Doc<IFavoriteRegistrationGroup>;
    favorites: Doc<IFavoriteRegistration>[];
}

export type Props = IWithFavoriteGroupInjectedProps;

export function withFavoriteGroup<T extends Props = Props>(
    WrappedComponent: React.ComponentType<T>
) {
    const ComponentWithFavoriteGroup = (props: Optionalize<T, IWithFavoriteGroupInjectedProps>) => {
        const store = React.useContext(StoreContext);

        const group = store.favorites.activeFavoriteGroup;
        const favorites = group && store.favorites.favoritesByGroup(group.id);
        return group
            ? <WrappedComponent
                group={group}
                favorites={favorites}
                {...(props as T)}
            />
            : <></>;
    }

    return observer(ComponentWithFavoriteGroup);
}
