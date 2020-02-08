import React from "react";
import store from "../../../stores/root-store";
import { IFavoriteRegistration, IFavoriteRegistrationGroup } from "../../../../common/dist";
import { observer } from "mobx-react-lite";

export interface IWithFavoriteInjectedProps {
    favorites: IFavoriteRegistration[];
}

export type Props = {
    group: IFavoriteRegistrationGroup & { id: string }
};

export function withFavorites<T extends IWithFavoriteInjectedProps = any>(
    WrappedComponent: React.ComponentType<T>
) {
    const ComponentWithFavorites = (props: any) => {

        const { group } = props;
        if (!group) return <></>;

        const favorites = store.favorites.favoritesByGroup(group.id);

        return favorites
            ? <WrappedComponent
                favorites={favorites}
                {...(props as T)}
            />
            : <></>;
    }

    return observer(ComponentWithFavorites);
}
