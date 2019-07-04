import * as React from 'react';
import { INameWithIcon } from '../../../../common';
import classNames from 'classnames';
import Checkbox from '@material/react-checkbox';
import { TextFieldOld } from '../../../mdc/textfield';

export const SettingsListItem = (props: React.HTMLProps<HTMLDivElement> & { itemData: INameWithIcon, isSelected?: boolean, onSelect: () => void, edit?: boolean }) => {
    const { className = [], itemData: { name, icon }, isSelected, edit, onSelect, ...restProps } = props;

    const cssClasses = classNames("settings-list-item", ...className, { "settings-list-item--selected": edit });
    const iconJSX = icon ? <i className="icon material-icons">{icon}</i> : undefined;

    const nameJSX = edit
        ? <TextFieldOld focus={true} value={name}></TextFieldOld>
        : name;

    return <div className={cssClasses} {...restProps}>
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