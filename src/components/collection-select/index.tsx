import * as React from 'react';
import { SelectOption, Select } from '../../mdc/select';

export interface ICollectionListProps {
    readonly label: string;
    readonly items: { name: string, id: string }[];
    readonly onChange: (value: string) => void;
    readonly value: string | undefined;
}

export const CollectionSelect = (props: ICollectionListProps) => {

    const { items, value, onChange, label } = props;
    const listItems = items.map(i =>
        <SelectOption text={i.name!} value={i.id} key={i.id}></SelectOption>
    );

    return (
        <Select value={value} outlined={true} label={label} onChange={onChange}>
            <SelectOption text="" value=""></SelectOption>
            {listItems}
        </Select>
    );
};
