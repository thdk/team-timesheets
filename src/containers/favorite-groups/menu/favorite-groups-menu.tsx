import * as React from "react";
import { Menu, MenuItem, MenuSurfaceAnchor } from "@rmwc/menu";
import { Button } from "@rmwc/button";
import { CustomEventT } from "@rmwc/types";
import { ListDivider, ListItem } from "@rmwc/list";

import { IFavoriteRegistrationGroup } from "../../../../common/dist";

export type FavoriteGroupsMenuProps = {
    groups: ({ id: string } & IFavoriteRegistrationGroup)[];
    onSelect: (id: string | null) => void;
}

export const FavoriteGroupsMenu = (props: FavoriteGroupsMenuProps) => {
    const { groups, onSelect } = props;

    const [isOpen, setIsOpen] = React.useState(false);

    const handleSelect = React.useCallback((evt: CustomEventT<{
        index: number;
        item: HTMLElement;
    }>) => {
        const group = groups[evt.detail.index];
        onSelect(group ? group.id : null);
    }, [onSelect]);

    const handleClose = React.useCallback(() => {
        setIsOpen(false);
    }, [setIsOpen]);

    const handleOpen = React.useCallback(() => {
        if (groups.length) {
            setIsOpen(true);
        }
        else {
            onSelect(null);
        }
    }, [setIsOpen, onSelect, groups]);

    return <MenuSurfaceAnchor>
        <Menu
            open={isOpen}
            onSelect={handleSelect}
            onClose={handleClose}
            style={{ width: "178px" }}
        >
            {groups.map(group => <ListItem
                role="menuitem"
                tabIndex={0}
                key={group.id}
                theme={["onSurface"]}
            >
                <div>{group.name}</div>
            </ListItem>)}
            <ListDivider
                theme={["onSurface"]}
            />
            <MenuItem
                theme={["onSurface"]}
            >
                New
            </MenuItem>
        </Menu>
        <Button
            onClick={handleOpen}
            dense
            className="grouped-registration-header-add-button prevent-propagation"
            theme={["onPrimary", "primaryBg"]}
        >+</Button>
    </MenuSurfaceAnchor>;
};