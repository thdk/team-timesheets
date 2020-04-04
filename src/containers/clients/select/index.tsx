import * as React from 'react';

import { CollectionSelect } from '../../../components/collection-select';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../../contexts/store-context';

export interface IClientSelectProps {
    value?: string;
    label?: string;
    onChange: (value: string) => void;
}

export const ClientSelect = observer((props: IClientSelectProps) => {
    const store = React.useContext(StoreContext);

    const { label = "Client", value = "", onChange } = props;
    return (
        <CollectionSelect
            value={value}
            items={store.config.clients}
            label={label}
            onChange={onChange} />
    );
});

export default ClientSelect;