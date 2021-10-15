import * as React from 'react'
import { IFavoriteRegistrationGroup } from "../../../../common/dist";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../contexts/store-context";

export interface IWithFavoriteGroupsProps {
    groups: (IFavoriteRegistrationGroup & { id: string })[];
}

export type Props = IWithFavoriteGroupsProps;

export function withFavoriteGroups<T extends Props = Props>(
    WrappedComponent: React.ComponentType<T>
) {
    const ComponentWithFavoriteGroups = (props: Optionalize<T, IWithFavoriteGroupsProps>) => {
        const store = useStore();

        return store.favorites.collection.isFetched
            ? <WrappedComponent
                {...({groups: store.favorites.groups,...props} as T)}
            />
            : <></>;
    }

    return observer(ComponentWithFavoriteGroups);
}

export default withFavoriteGroups;
