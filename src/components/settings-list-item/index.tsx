import * as React from 'react';
import { INameWithIcon } from '../../../common';
import classNames from 'classnames';
import { Checkbox } from '@rmwc/checkbox';
import { useState } from 'react';
import TextField, { Input } from '@material/react-text-field';
import { observer } from 'mobx-react-lite';
import { Icon } from '@rmwc/icon';

export interface ISettingsItemProps extends Omit<React.HTMLProps<HTMLDivElement>, "onChange"> {
    readonly itemData: Partial<INameWithIcon> & { id?: string };
    readonly edit?: boolean;
    readonly isChecked?: boolean;
    readonly onSelectItem?: (id: string) => void;
    readonly onChangeItem?: (data: INameWithIcon) => void;
    readonly onCancel?: () => void;
    readonly settingName?: string;
}

export const SettingsListItem = observer((props: ISettingsItemProps) => {
    const { className = [],
        itemData,
        isChecked,
        edit,
        onSelectItem,
        onChangeItem,
        onCancel,
        settingName,
        ...restProps
    } = props;

    const [iconElRef] = useState<any>(React.createRef());
    const [nameElRef] = useState<any>(React.createRef());

    const [icon, setIcon] = useState(itemData.icon);
    const [name, setName] = useState(itemData.name);

    const onKeyUp = (e: React.KeyboardEvent) => {
        e.preventDefault();
        e.stopPropagation();

        switch (e.key) {
            case "Enter": {
                const iconValue = iconElRef.current && iconElRef.current.inputElement ? iconElRef.current.inputElement.value : "";
                const nameValue = nameElRef.current && nameElRef.current.inputElement ? nameElRef.current.inputElement.value : "";
                onChangeItem && onChangeItem({ icon: iconValue, name: nameValue });
            }
                break;
            case "Escape":
                onCancel && onCancel();
                break;
            default:
                break;
        }
    };

    const cssClasses = classNames("settings-list-item", className, { "settings-list-item--selected": edit });
    const iconJSX = icon ? <Icon icon={icon} theme={["textPrimaryOnBackground"]} /> : undefined;

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
                label={settingName ? settingName + " icon" : "Icon"}>
                <Input<HTMLInputElement> autoFocus ref={iconElRef} value={icon} onChange={e => setIcon(e.currentTarget.value)}></Input>
            </TextField>
            <TextField
                label={settingName ? settingName + " name" : "Name"}>
                <Input<HTMLInputElement> ref={nameElRef} value={name} onChange={e => setName(e.currentTarget.value)}></Input>
            </TextField>
        </>
        : undefined;

    const checkboxJSX = itemData.id && onSelectItem
        ? <div className="list-item-checkbox">
            <Checkbox
                checked={isChecked}
                onChange={onSelectItem.bind(null, itemData.id)}
                onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                }}
            />
        </div>
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
        {checkboxJSX}
    </div>;
});