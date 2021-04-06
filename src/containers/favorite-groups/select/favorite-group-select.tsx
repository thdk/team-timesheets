import * as React from 'react';
import { observer } from 'mobx-react-lite';

import { Select } from '@rmwc/select';
import { useFavoriteGroupStore } from '../../../contexts/favorite-context/favorite-context';

export const FavoriteGroupSelect = observer(({
    value,
    onChange,
}: {
    value: string | undefined,
    onChange(value: string): void,
}) => {
    const favoriteGroupStore = useFavoriteGroupStore();

    const onGroupChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.currentTarget.value;
        onChange(value);
    }

    const groups = favoriteGroupStore.groups.map(
        ({ id, name }) => (
            <option
                value={id}
                key={id}>
                {name}
            </option>
        )
    );

    return (
        <Select
            value={value || ""}
            outlined
            label="Favorite group"
            onChange={onGroupChange}>
            {groups}
        </Select>
    );
});
