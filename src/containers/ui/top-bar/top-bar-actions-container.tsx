import React from "react";
import { observer } from "mobx-react-lite";

import { TopBarActions as PureTopBarActions } from "./top-bar-actions";
import { useViewStore } from "../../../stores/view-store";

export const TopBarActions = observer(() => {
    const view = useViewStore();

    const contextual = !!Array.from(view.selection.keys()).length;

    const actions = view.actions.filter(a => !!a.contextual === contextual);

    return <PureTopBarActions actions={actions} />;
});