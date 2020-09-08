import * as React from 'react';
import { observer } from 'mobx-react-lite';

import { INameWithIcon } from '../../../common';
import { SettingsListItem } from '../settings-list-item';
import classNames from 'classnames';
import { ObservableMap } from 'mobx';
import { AddItem } from './AddItem';

import './settingslist.scss';

export interface IListItemData { icon?: string, name?: string };

export interface ISettingsListProps extends React.HTMLProps<HTMLDivElement> {
    readonly onAddItem?: (item: INameWithIcon, id?: string) => void;
    readonly onToggleSelection: (id: string) => void;
    readonly onItemClick?: (id: string) => void;
    readonly items: (INameWithIcon & { id: string })[];
    readonly readonly?: boolean;
    readonly activeItemId?: string;
    readonly selection: ObservableMap<string, any>;
}

export const SettingsList = observer(({
    onAddItem,
    selection,
    activeItemId,
    onToggleSelection: toggleSelection,
    items,
    readonly,
    onItemClick,
    ...restProps
}: ISettingsListProps) => {

    const itemsJSX = items.map(i => (
        <SettingsListItem
            key={i.id}
            onChangeItem={onAddItem ? data => onAddItem(data, i.id) : undefined}
            onClick={readonly || !onItemClick ? undefined : onItemClick.bind(null, i.id)}
            isChecked={selection.has(i.id)}
            edit={activeItemId === i.id}
            itemData={i}
            onSelectItem={readonly ? undefined : toggleSelection}>
        </SettingsListItem>
    ));

    const addItemsJSX = readonly || !onAddItem ? undefined : <AddItem addListItem={onAddItem} />

    const { className, ...otherProps } = restProps;
    const cssClasses = classNames("settings-list", className);
    return <div className={cssClasses}  {...otherProps}>
        {itemsJSX}
        {addItemsJSX}
    </div>;
});
