import * as React from 'react';
import { INameWithIcon } from '../../../../common';
import classNames from 'classnames';
import Checkbox from '@material/react-checkbox';
import TextFieldOld from '../../../mdc/textfield';
import { useState } from 'react';

export interface ISettingsItemProps extends Omit<React.HTMLProps<HTMLDivElement>, "onChange"> {
    readonly itemData: INameWithIcon;
    readonly edit?: boolean;
    readonly isSelected?: boolean;
    readonly onSelect: () => void;
    readonly onChange?: (data: INameWithIcon) => void;
    readonly onCancel?: () => void;
}

export const SettingsListItem = (props: ISettingsItemProps) => {
    const { className = [],
        itemData,
        isSelected,
        edit,
        onSelect,
        onChange,
        onCancel,
        ...restProps
    } = props;

    const [iconElRef] = useState(React.createRef<HTMLInputElement>());
    const [nameElRef] = useState(React.createRef<HTMLInputElement>());

    const [icon, setIcon] = useState(itemData.icon);
    const [name, setName] = useState(itemData.name);

    const onKeyUp = (e: React.KeyboardEvent) => {
        switch (e.key) {
            case "Enter":
                const iconValue = iconElRef.current ? iconElRef.current.value : "";
                const nameValue = nameElRef.current ? nameElRef.current.value : "";
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
    const iconJSX = edit
        ? <TextFieldOld dense={true}
            onChange={setIcon}
            ref={iconElRef}
            value={icon}/>
        : icon ? <i className="icon material-icons">{icon}</i> : undefined;

    const nameJSX = edit
        ? <TextFieldOld
            dense={true}
            onChange={setName}
            ref={nameElRef}
            focus={true}
            value={name}/>
        : name;

    return <div className={cssClasses} {...restProps} tabIndex={0} onKeyUp={onKeyUp}>
        <div className="list-item-props">
            <div className="item-icon">
                {iconJSX}
            </div>
            <div className="item-name">
                {nameJSX}
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