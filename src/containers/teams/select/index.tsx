import * as React from 'react';
import { observer } from 'mobx-react';

import { FormField } from '../../../components/layout/form';
import CollectionSelect from '../../../components/collection-select';
import store from '../../../stores/root-store';

export interface ITeamSelectProps {
    value?: string;
    label?: string;
    onChange: (value: string) => void;
}

@observer
export default class TeamSelect extends React.Component<ITeamSelectProps> {
    render() {
        const { label = "Team", value = "", onChange } = this.props;
        return (
            <>
                <FormField first={false}>
                    <CollectionSelect value={value} items={store.config.teams} label={label} onChange={onChange}></CollectionSelect>
                </FormField>
            </>
        );
    }
}