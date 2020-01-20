import React, { useCallback } from "react";

import { IWithFavoriteGroupInjectedProps, withFavoriteGroup } from "../with-favorite-group";
import FavoriteGroupDetail from "./favorite-group-detail";
import { observer } from "mobx-react-lite";
import { IWithFavoriteInjectedProps } from "../with-favorites";

type Props = IWithFavoriteGroupInjectedProps & IWithFavoriteInjectedProps;

const FavoriteGroupContainer = observer((props: Props) => {
    const { group, favorites } = props;

    const handleNameChanged = useCallback((name: string) => {
        group.data!.name = name;
    }, [group]);


    return <FavoriteGroupDetail
        onNameChanged={handleNameChanged}
        favorites={favorites}
        name={group.data!.name}
    />;
});

export default withFavoriteGroup(FavoriteGroupContainer);
