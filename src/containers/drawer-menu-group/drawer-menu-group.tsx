import React from "react";
import { ReactNode } from "react";
import { ListItem, ListItemGraphic, ListItemText, ListDivider } from "@rmwc/list";

export interface DrawerMenuGroupItem {
    text: string;
    icon?: ReactNode;
    action(): void;
}

export const DrawerMenuGroup = ({
    items,
    bottomDivider = true,
}: {
    items: DrawerMenuGroupItem[];
    bottomDivider?: boolean;
}) => {
    return (
        <>
            {items.map(
                ({
                    icon,
                    text,
                    action,
                },
                    key,
                ) => {
                    return (
                        <ListItem
                            onClick={action}
                            key={key}
                        >
                            <ListItemGraphic icon={icon} theme={["textPrimaryOnBackground"]} />
                            <ListItemText>
                                {text}
                            </ListItemText>
                        </ListItem>
                    );
                })}

            {bottomDivider ? <ListDivider /> : null}
        </>
    );
};
DrawerMenuGroup.displayName = "DrawerMenuGroup";
