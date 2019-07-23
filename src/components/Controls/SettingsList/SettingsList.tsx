import * as React from 'react';

import { INameWithIcon } from '../../../../common';
import { SettingsListItem } from './Item';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { ObservableMap } from 'mobx';
import { AddItem } from './AddItem';

export interface ISettingsListProps extends React.HTMLProps<HTMLDivElement> {
    readonly addItem: (item: INameWithIcon, id?: string) => void;
    readonly toggleSelection: (id: string) => void;
    readonly onItemClick: (id: string) => void;
    readonly items: (INameWithIcon & { id: string })[];
    readonly readonly?: boolean;
    readonly activeItemId?: string;
    readonly selection: ObservableMap<string, any>;
}

export const SettingsList = observer(({ addItem, selection, activeItemId, toggleSelection, items, readonly, onItemClick, ...restProps }: ISettingsListProps) => {

    const itemsJSX = items.map(i => (
        <SettingsListItem key={i.id} onChangeItem={data => addItem(data, i.id)}
            onClick={readonly ? undefined : onItemClick.bind(null, i.id)}
            isChecked={selection.has(i.id)}
            edit={activeItemId === i.id}
            itemData={i}
            onSelectItem={readonly ? undefined : toggleSelection}>
        </SettingsListItem>
    ));

    const addItemsJSX = readonly ? undefined : <AddItem addListItem={addItem} />

    const { className, ...otherProps } = restProps;
    const cssClasses = classNames("settings-list", className);
    return <div className={cssClasses}  {...otherProps}>
        {itemsJSX}
        {addItemsJSX}
    </div>;
});