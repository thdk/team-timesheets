import * as React from 'react';
import { observer } from 'mobx-react';
import { SelectOption, Select } from '../../MaterialUI/select';

export interface ICollectionList {
    label: string;
    items: { name: string, id: string }[];
    onChange: (value: string) => void;
    value: string | undefined;
}

@observer
export default class CollectionSelect extends React.Component<ICollectionList> {
    render() {
        const { items, value, onChange, label } = this.props;
        const listItems = items.map(i =>
            <SelectOption text={i.name!} value={i.id} key={i.id}></SelectOption>
        );

        return (
            <Select value={value} outlined={true} label={label} onChange={onChange}>
                <SelectOption text="" value=""></SelectOption>
                {listItems}
            </Select>
        );
    }
}