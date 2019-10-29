import * as React from 'react';
import { Dialog, DialogTitle, DialogContent } from '@rmwc/dialog';

import icons from './icons';
import { useCallback, useState } from 'react';
import { Icon } from '@rmwc/icon';
import DebouncedTextfield from '../debounced-textfield';


type Props = {
    onClose: (icon: string | undefined) => void,
    isOpen: boolean,
};

export const IconDialog = (props: Props) => {
    const { onClose, isOpen } = props;

    const [iconQuery, setIconQuery] = useState<string | undefined>(undefined);

    // const [isOpen, setIsOpen] = useState(false);

    const handleDialogClose = useCallback((event: CustomEvent<{ action?: string }>) => {
        const { action } = event.detail;

        onClose(action === "close" || action === "destroy" ? undefined : event.detail.action);
        // setIsOpen(false)
    }, []);

    const handleQueryTextBoxChange = (query: string | undefined) => {
        setIconQuery(query);
    };

    const handleIconKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter") {
            const attr = event.currentTarget.attributes.getNamedItem("data-mdc-dialog-action");
            onClose(attr ? attr.value : undefined);
        }
    }, [onClose]);

    const filteredIcons = iconQuery ?
        icons.filter(i => i.indexOf(iconQuery) !== -1)
        : icons;

    return <Dialog
        open={isOpen}
        onClose={handleDialogClose}>
        <DialogTitle>Pick your icon</DialogTitle>
        <DialogContent className="icon-dialog-content">
            <DebouncedTextfield
                value={iconQuery}
                onChange={handleQueryTextBoxChange}
                outlined
                label="Search icon"
                style={{
                    marginTop: "20px",
                    marginBottom: "20px"
                }}
                tabIndex={1}
            />
            <div className="icon-dialog-content-items">
                {filteredIcons.map((icon, i) =>
                    <div
                        tabIndex={i + 2}
                        key={i}
                        className="icon-dialog-content-item"
                        data-mdc-dialog-action={`icon-code-${icon}`}
                        onKeyDown={handleIconKeyDown}
                    >
                        <Icon
                            className="icon-dialog-content-item-icon"
                            icon={icon}
                        />
                        <div className="icon-dialog-content-item-name">{icon}</div>
                    </div>
                )}
            </div>
        </DialogContent>
    </Dialog>
};