import * as React from 'react';
import { observable } from 'mobx';
import { FormField } from '../../Layout/form';
import { Select, SelectOption } from '../../../MaterialUI/select';
import store from '../../../stores/RootStore';

@observable
export default class ProjectSelect extends React.Component {
    render() {
        const project = store.timesheets.registration ? store.timesheets.registration.data!.project : "";
        const projects = Array.from(store.config.projects.docs.values())
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
                <FormField>
                    <Select value={project} outlined={true} label="Project" onChange={this.onProjectChange}>
                        {projects}
                    </Select>
                </FormField>
            </>
        );
    }

    onProjectChange = (value: string) => {
        if (store.timesheets.registration && store.timesheets.registration.data)
            store.timesheets.registration.data.project = value;
    }
}