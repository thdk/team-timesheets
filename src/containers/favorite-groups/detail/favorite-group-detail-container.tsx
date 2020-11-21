import React, { useCallback } from "react";
import { observer } from "mobx-react-lite";

import { IWithFavoriteGroupInjectedProps, withFavoriteGroup } from "../with-favorite-group";
import { FavoriteGroupDetailForm as PureFavoriteGroupDetailForm } from "./favorite-group-detail";

type Props = IWithFavoriteGroupInjectedProps;

export const FavoriteGroupDetailForm = withFavoriteGroup(
    observer((props: Props) => {
        const { group } = props;

        const handleNameChanged = useCallback((name: string) => {
            group.name = name;
        }, [group]);


        return group
            ? <PureFavoriteGroupDetailForm
                onNameChanged={handleNameChanged}
                name={group.name}
            />
            : null;
    })
);
