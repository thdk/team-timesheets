import * as React from 'react'
import { IFavoriteRegistration, IFavoriteRegistrationGroup } from "../../../../common/dist";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../contexts/store-context";

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
        const store = useStore();

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
