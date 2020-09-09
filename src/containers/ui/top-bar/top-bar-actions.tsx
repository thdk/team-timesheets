import React from "react";
import { IViewAction } from "../../../stores/view-store";
import { TopAppBarActionItem } from "@rmwc/top-app-bar";

export const TopBarActions = ({
    actions,
}: {
    actions: IViewAction[];
}) => {
    const onClick = (viewAction: IViewAction) => {
        viewAction.action(viewAction.selection);
    };

    return <>
        {
            actions.map((a, i) => {
                const active = a.isActive !== undefined ? (a.isActive === true ? true : a.isActive === false ? false : a.isActive()) : false;
                return !a.selection || a.selection.size
                    ? a.iconActive
                        ? (
                            <TopAppBarActionItem
                                key={i}
                                checked={!!active}
                                onIcon={a.iconActive.content}
                                icon={a.icon.content}
                                onClick={() => onClick(a)}
                            />
                        ) : (
                            <TopAppBarActionItem
                                key={i}
                                checked={!!active}
                                icon={a.icon.content}
                                onClick={() => onClick(a)}
                            />
                        )
                    : <div key={i}></div>;
            })}
    </>;
};