import * as React from 'react';
import { INameWithIcon } from '../../../stores/ConfigStore';
import { AddListItem, IListItemData } from '../../Controls/AddListItem';
import { ListItem, List } from '../../../MaterialUI/list';

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
                    const { id, icon, name, isSelected, } = c;
                    p.push(isSelected && canEdit
                        ? <AddListItem key={id} onCancel={this.onSelectItem.bind(this, undefined)} onSave={(data) => this.saveListItem(data, id)} data={c} onClick={this.onSelectItem.bind(this, id)}></AddListItem>
                        : <ListItem onClick={this.onSelectItem.bind(this, id)} icon={icon} key={id} lines={[name!]}></ListItem>
                    );
                return p;
            }, new Array());

        const addItem = canAdd
            ? <AddListItem labels={{add: labels.add}} onSave={this.saveListItem.bind(this)} ></AddListItem>
            : undefined;

        return (
            <List isTwoLine={false}>
                {listItems}
                {addItem}
            </List>
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