import * as React from 'react'
import { IFavoriteRegistrationGroup, IFavoriteRegistration } from "../../../../common/dist";
import { observer } from "mobx-react-lite";
import { Doc } from "firestorable";
import { useStore } from "../../../contexts/store-context";

export interface IWithFavoriteGroupInjectedProps {
    group: Doc<IFavoriteRegistrationGroup>;
    favorites: Doc<IFavoriteRegistration>[];
}

export type Props = IWithFavoriteGroupInjectedProps;

export function withFavoriteGroup<T extends Props = Props>(
    WrappedComponent: React.ComponentType<T>
) {
    const ComponentWithFavoriteGroup = (props: Optionalize<T, IWithFavoriteGroupInjectedProps>) => {
        const store = useStore();

        const group = store.favorites.activeDocument;
        return group
            ? <WrappedComponent
                group={group}
                {...(props as T)}
            />
            : <></>;
    }

    return observer(ComponentWithFavoriteGroup);
}
