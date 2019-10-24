import * as React from 'react';

import store from '../../../stores/root-store';
import CollectionSelect from '../../../components/collection-select';
import { observer } from 'mobx-react-lite';

export interface IClientSelectProps {
    value?: string;
    label?: string;
    onChange: (value: string) => void;
}

export const ClientSelect = observer((props: IClientSelectProps) => {
    const { label = "Client", value = "", onChange } = props;
    return (
        <CollectionSelect
            value={value}
            items={store.config.clients}
            label={label}
            onChange={onChange}>
        </CollectionSelect>
    );
});

export default ClientSelect;