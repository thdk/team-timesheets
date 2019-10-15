import * as React from 'react';
import { FormField } from '../../../components/layout/form';
import store from '../../../stores/root-store';
import { observer } from 'mobx-react';
import CollectionSelect from '../../../components/collection-select';

export interface IClientSelectProps {
    value?: string;
    label?: string;
    onChange: (value: string) => void;
}

@observer
export default class ClientSelect extends React.Component<IClientSelectProps> {
    render() {
        const { label = "Client", value = "", onChange } = this.props;
        return (
            <>
                <FormField first={false}>
                    <CollectionSelect value={value} items={store.config.clients} label={label} onChange={onChange}></CollectionSelect>
                </FormField>
            </>
        );
    }
}