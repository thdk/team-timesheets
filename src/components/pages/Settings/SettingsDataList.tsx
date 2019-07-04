import * as React from 'react';;
import { AddListItem, IListItemData } from '../../Controls/AddListItem';
import { INameWithIcon } from '../../../../common/dist';
import { SettingsListItem } from '../../Controls/SettingsList/Item';
import store from '../../../stores/RootStore';
import { observer } from 'mobx-react';

export interface ISettingsItem extends INameWithIcon {
    id: string;
    isSelected: boolean;
}

export interface ISettingsDataListProps {
    items: ISettingsItem[];
    canAdd: boolean;
    canEdit: boolean;
    onSave: (data: INameWithIcon, id?: string) => void;
    onItemSelect: (id: string | undefined) => void;
    onItemClick: (id: string) => void;
    labels: { add: string; }
}

@observer
export default class SettingsDataList extends React.Component<ISettingsDataListProps> {
    render() {
        const { items, canEdit, canAdd, labels } = this.props;
        const listItems = items.map(c => {
            const { id } = c;
            const isSelected = store.view.selection.has(id);
            return <SettingsListItem edit={store.config.clientId === id} onSelect={this.onSelectItem.bind(this, id)} isSelected={isSelected} key={id} onClick={this.onClickItem.bind(this, id)} itemData={c} autoFocus></SettingsListItem>;
        });

        const addItem = canAdd
            ? <AddListItem labels={{ add: labels.add }} onSave={this.saveListItem.bind(this)} ></AddListItem>
            : undefined;

        return (
            <div className="settings-list">
                {listItems}
                {addItem}
            </div>
        );
    }

    onSelectItem(id: string | undefined) {
        this.props.onItemSelect(id);
    }

    onClickItem(id: string) {
        this.props.onItemClick(id);
    }

    saveListItem(data: IListItemData, id?: string) {
        if (data.name) {
            this.props.onSave({ name: data.name, icon: data.icon }, id);
        }
    }
}