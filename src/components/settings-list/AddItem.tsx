import * as React from 'react';
import { INameWithIcon } from '../../../common';
import { SettingsListItem } from '../settings-list-item';

export const AddItem = ({
    onAddItem,
    label = "Add item",
    ...divProps
}: {
    onAddItem: (data: INameWithIcon) => void;
    label?: string;
} & React.HTMLProps<HTMLDivElement>) => {

    const [data, setData] = React.useState<Partial<INameWithIcon> | undefined>(undefined);


    if (data) {
        return <SettingsListItem
            edit={true}
            itemData={data}
            onChangeItem={data => {
                onAddItem(data);
                setData(undefined);
            }}
            onCancel={() => setData(undefined)}
            {...divProps}
            className={"settings-list-new-item"}
        ></SettingsListItem>
    } else {
        return <div className="settings-list-add-item" {...{
            ...divProps, onClick: e => {
                e.preventDefault();
                e.stopPropagation();
                setData({});
            }
        }}>
            <div className="list-item-props">
                <i className="material-icons item-icon">add</i>
                <a href="#" className="add-item-button">{label}</a>
            </div>
        </div>
    }
}