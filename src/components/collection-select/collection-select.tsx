import * as React from 'react';
import { Select } from '@rmwc/select';
import { useCallback } from 'react';

export interface ICollectionSelectItem {
    value: string,
    label: string,
}

export interface ICollectionListProps {
    readonly label: string;
    readonly items: ICollectionSelectItem[];
    readonly onChange: (value: string) => void;
    readonly value: string | undefined;
    readonly id: string;
}

export const CollectionSelect = (props: ICollectionListProps) => {
    const { items,
        id,
        label,
        onChange:
        onValueChange,
        value,
    } = props;

    const onChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        onValueChange(event.currentTarget.value);
    }, [onValueChange])

    return (
        <Select
            id={id}
            value={value}
            outlined={true}
            label={label}
            onChange={onChange}
            placeholder={""}
            options={items}
        />
    );
};
