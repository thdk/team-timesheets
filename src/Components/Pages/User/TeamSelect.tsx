import * as React from 'react';
import { FormField } from '../../Layout/form';
import store from '../../../stores/RootStore';
import { observer } from 'mobx-react';
import CollectionSelect from '../../Controls/CollectionSelect';

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