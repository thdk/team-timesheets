import * as React from 'react';

import { CollectionSelect } from '../../../components/collection-select';
import { observer } from 'mobx-react-lite';
import { useClients } from '../../../contexts/client-context';

export interface IClientSelectProps {
    value?: string;
    label?: string;
    onChange: (value: string) => void;
}

export const ClientSelect = observer((props: IClientSelectProps) => {
    const { clients } = useClients();

    const { label = "Client", value = "", onChange } = props;
    return (
        <CollectionSelect
            id={"client-collection"}
            value={value}
            items={clients.map(({ id, name }) => ({ label: name, value: id }))}
            label={label}
            onChange={onChange} />
    );
});

export default ClientSelect;
