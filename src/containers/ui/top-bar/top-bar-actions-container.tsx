import React from "react";
import { observer } from "mobx-react-lite";

import { TopBarActions as PureTopBarActions } from "./top-bar-actions";
import { useViewStore } from "../../../contexts/view-context";

export const TopBarActions = observer(() => {
    const view = useViewStore();

    return <PureTopBarActions actions={view.actions} />;
});