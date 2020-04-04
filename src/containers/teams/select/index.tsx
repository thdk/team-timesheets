import * as React from 'react';
import { observer } from 'mobx-react';

import { FormField } from '../../../components/layout/form';
import CollectionSelect from '../../../components/collection-select';
import { StoreContext } from '../../../contexts/store-context';

export interface ITeamSelectProps {
    value?: string;
    label?: string;
    onChange: (value: string) => void;
}

export const TeamSelect = observer((props: ITeamSelectProps) => {
    const store = React.useContext(StoreContext);

    const { label = "Team", value = "", onChange } = props;
    return (
        <>
            <FormField first={false}>
                <CollectionSelect value={value} items={store.config.teams} label={label} onChange={onChange}></CollectionSelect>
            </FormField>
        </>
    );
});
