import * as React from 'react';
import { useState, useCallback, useEffect } from 'react';
import { TextField, TextFieldProps } from '@rmwc/textfield';

import { IconDialog } from './dialog';
import icons from './icons';

export interface IIconPickerProps {
    editIcon?: string;
    onChange: (icon: string) => void;
};

type Props = IIconPickerProps
    & Omit<TextFieldProps, "icon" | "trailingIcon" | "onKeyDown">;

const IconPicker = (props: Props) => {

    const {
        value,
        label = null,
        editIcon = "edit",
        onChange,
        ...restTextField
    } = props;

    const [isOpen, setIsOpen] = useState(false);

    const [icon, setIcon] = useState((value || "").toString())

    const handleTextFieldChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setIcon(e.target.value);
    }, []);

    const handleTrailingIconKeyDown = useCallback((e: React.KeyboardEvent<TextField>) => {
        if (e.key === "Enter") {
            setIsOpen(true);
        };
    }, []);

    const handleTrailingIconClick = useCallback(() => {
        setIsOpen(true);
    }, [isOpen]);

    const handleDialogClose = useCallback((icon: string | undefined) => {
        if (icon === "destroy") return;

        if (icon) {
            setIcon(icon.substr(10));
        } else {
            setIcon("");
        }

        setIsOpen(false);
    }, []);

    useEffect(() => {
        // only call onChange if value of inputField is a valid icon
        if (icons.indexOf(icon) !== -1) {
            onChange(icon);
        }
    }, [icon, onChange]);

    const Dialog = () =>
        isOpen
            ? <IconDialog
                isOpen={true}
                onClose={handleDialogClose}
            />
            : null;

    return (<>
        <TextField
            icon={icon}
            trailingIcon={{
                icon: editIcon,
                onClick: handleTrailingIconClick,
                tabIndex: 0,
                onKeyDown: handleTrailingIconKeyDown
            }}
            label={(label || "Icon").toString()}
            value={icon}
            onChange={handleTextFieldChange}
            {...restTextField}
        >
        </TextField>
        <Dialog />
    </>
    );
};

IconPicker.defaultProps = {};

export default IconPicker;