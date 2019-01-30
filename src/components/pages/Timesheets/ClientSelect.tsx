import * as React from 'react';
import { FormField } from '../../Layout/form';
import store from '../../../stores/RootStore';
import { observer } from 'mobx-react';
import CollectionSelect from '../../Controls/CollectionList';

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