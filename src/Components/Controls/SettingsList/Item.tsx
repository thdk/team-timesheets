import * as React from 'react';
import { INameWithIcon } from '../../../../common';
import classNames from 'classnames';
import Checkbox from '@material/react-checkbox';
import { useState } from 'react';
import TextField, { Input } from '@material/react-text-field';

export interface ISettingsItemProps extends Omit<React.HTMLProps<HTMLDivElement>, "onChange"> {
    readonly itemData: INameWithIcon;
    readonly edit?: boolean;
    readonly isSelected?: boolean;
    readonly onSelect: () => void;
    readonly onChange?: (data: INameWithIcon) => void;
    readonly onCancel?: () => void;
    readonly settingName: string;
}

export const SettingsListItem = (props: ISettingsItemProps) => {
    const { className = [],
        itemData,
        isSelected,
        edit,
        onSelect,
        onChange,
        onCancel,
        settingName,
        ...restProps
    } = props;

    const [iconElRef] = useState<React.RefObject<Input<HTMLInputElement>>>(React.createRef());
    const [nameElRef] = useState<React.RefObject<Input<HTMLInputElement>>>(React.createRef());

    const [icon, setIcon] = useState(itemData.icon);
    const [name, setName] = useState(itemData.name);

    const onKeyUp = (e: React.KeyboardEvent) => {
        switch (e.key) {
            case "Enter":
                const iconValue = iconElRef.current && iconElRef.current.inputElement ? iconElRef.current.inputElement.value : "";
                const nameValue = nameElRef.current && nameElRef.current.inputElement ? nameElRef.current.inputElement.value : "";
                onChange && onChange({ icon: iconValue, name: nameValue });
                break;
            case "Escape":
                onCancel && onCancel();
                break;
            default:
                break;
        }
    };

    const cssClasses = classNames("settings-list-item", ...className, { "settings-list-item--selected": edit });
    const iconJSX = icon ? <i className="icon material-icons">{icon}</i> : undefined;

    // Warning: manually edited @material/react-text-field/dist/Input.d.ts to make below compile
    // See: https://github.com/material-components/material-components-web-react/issues/965
    const nameJSX = edit
        ? undefined
        : <div className="item-name">
            {name}
        </div>;

    const formJSX = edit ?
        <>
            <TextField className="icon-picker"
                label={settingName + " icon"}>
                <Input<HTMLInputElement> autoFocus ref={iconElRef} value={icon} onChange={e => setIcon(e.currentTarget.value)}></Input>
            </TextField>
            <TextField
                label={settingName + " name"}>
                <Input<HTMLInputElement> ref={nameElRef} value={name} onChange={e => setName(e.currentTarget.value)}></Input>
            </TextField>
        </>
        : undefined;

    return <div className={cssClasses} {...restProps} tabIndex={0} onKeyUp={onKeyUp}>
        <div className="list-item-props">
            <div className="item-icon">
                {iconJSX}
            </div>
            {nameJSX}
            <div className="item-form">
                {formJSX}
            </div>
        </div>
        <div>
            <Checkbox
                checked={isSelected}
                onChange={onSelect}
                onClick={(e: MouseEvent) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}
            />
        </div>
    </div>;
};