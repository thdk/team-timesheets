import * as React from 'react';;
import { AddListItem, IListItemData } from '../../Controls/AddListItem';
import { INameWithIcon } from '../../../../common/dist';
import { SettingsListItem } from '../../Controls/SettingsList/Item';

export interface ISettingsItem extends INameWithIcon {
    id: string;
    isSelected: boolean;
}

export interface ISettingsDataListProps {
    items: ISettingsItem[];
    canAdd: boolean;
    canEdit: boolean;
    onSave: (data: INameWithIcon, id?: string) => void;
    onSelect: (id: string | undefined) => void;
    labels: { add: string;}
}

export default class SettingsDataList extends React.Component<ISettingsDataListProps> {
    render() {
        const {items, canEdit, canAdd, labels} = this.props;
            const listItems = items.reduce((p, c) => {
                    const { id, isSelected, } = c;
                    p.push(isSelected && canEdit
                        ? <AddListItem key={id} onCancel={this.onSelectItem.bind(this, undefined)} onSave={(data) => this.saveListItem(data, id)} data={c} onClick={this.onSelectItem.bind(this, id)}></AddListItem>
                        : <SettingsListItem onClick={this.onSelectItem.bind(this, id)} itemData={c} autoFocus></SettingsListItem>
                    );
                return p;
            }, new Array());

        const addItem = canAdd
            ? <AddListItem labels={{add: labels.add}} onSave={this.saveListItem.bind(this)} ></AddListItem>
            : undefined;

        return (
            <div className="settings-list">
                {listItems}
                {addItem}
            </div>
        );
    }

    onSelectItem(id: string | undefined) {
        this.props.onSelect(id);
    }

    saveListItem(data: IListItemData, id?: string) {
        if (data.name) {
            this.props.onSave({name: data.name, icon: data.icon}, id);
        }
    }
}