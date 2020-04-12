import * as React from 'react';
import { observer } from 'mobx-react-lite';

import { FormField } from '../../../components/layout/form';
import { CollectionSelect } from '../../../components/collection-select';
import { useStore } from '../../../contexts/store-context';

export interface ITeamSelectProps {
    value?: string;
    label?: string;
    onChange: (value: string) => void;
}

export const TeamSelect = observer((props: ITeamSelectProps) => {
    const store = useStore();

    const { label = "Team", value = "", onChange } = props;
    return (
        <FormField first={false}>
            <CollectionSelect
                id={"teams-collection"}
                value={value}
                items={store.config.teams.map(({ id, name }) => ({ label: name, value: id }))}
                label={label}
                onChange={onChange}
            />
        </FormField>
    );
});
