import * as React from 'react';
import { FormField } from '../../Layout/form';
import { Select, SelectOption } from '../../../MaterialUI/select';
import store from '../../../stores/RootStore';
import { observer } from 'mobx-react';

@observer
export default class ClientSelect extends React.Component {
    render() {
        const client = store.timesheets.registration ? store.timesheets.registration.data!.client : "";
        const clients = Array.from(store.config.clients.docs.values())
            .reduce((p, c) => {
                if (c.data) {
                    const { id, data: { name } } = c;
                    p.push(
                        <SelectOption text={name!} value={id} key={id}></SelectOption>
                    );
                }
                return p;
            }, new Array());

        return (
            <>
                <FormField first={false}>
                    <Select value={client} outlined={true} label="Client" onChange={this.onClientChange}>
                        <SelectOption text="" value=""></SelectOption>
                        {clients}
                    </Select>
                </FormField>
            </>
        );
    }

    onClientChange = (value: string) => {
        if (store.timesheets.registration && store.timesheets.registration.data)
            store.timesheets.registration.data.client = value;
    }
}