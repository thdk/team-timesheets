import * as React from 'react';
import { observer } from 'mobx-react';
import { Select } from '@rmwc/select';

export interface ICollectionListProps {
    readonly label: string;
    readonly items: { name: string, id: string }[];
    readonly onChange: (value: string) => void;
    readonly value: string | undefined;
}

@observer
export default class CollectionSelect extends React.Component<ICollectionListProps> {
    render() {
        const { items, value, onChange, label } = this.props;
        const listItems = items.map(i =>
            <option value={i.id} key={i.id}>{i.name}</option>
        );

        return (
            <Select value={value} outlined={true} label={label} onChange={onChange}>
                <option value=""></option>
                {listItems}
            </Select>
        );
    }
}
