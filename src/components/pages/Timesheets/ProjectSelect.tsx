import * as React from 'react';
import { observer } from 'mobx-react';

import { FormField } from '../../Layout/form';
import { Select, SelectOption } from '../../../MaterialUI/select';
import store from '../../../stores/RootStore';
import { Chip, ChipSet } from '../../../MaterialUI/chips';
import { FlexGroup } from '../../Layout/flex';

@observer
export default class ProjectSelect extends React.Component {
    render() {
        const project = store.timesheets.registration ? store.timesheets.registration.data!.project : "";

        const userRecentProjects = store.user.user ? store.user.user.data!.recentProjects : [];

        const recentProjects = userRecentProjects.slice(0, 3).reduce((p, c) => {
            const projectData = store.config.projects.docs.get(c);
            if (projectData && projectData.data) {
                p.push(
                    projectData
                );
            } else {
                console.log("No project data found for recent project id: " + c)
            }
            return p;
        }, new Array());

        const x = recentProjects.map(projectData =>
            <Chip onClick={this.projectClicked} id={projectData.id} {...projectData.data} text={projectData.data.name} key={projectData.id} isSelected={projectData.id === project}></Chip>
        );

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
                <FlexGroup extraCssClass="row">
                    <FormField style={{ display: (!!recentProjects).toString() }}>
                        <ChipSet chips={x} type="choice"></ChipSet>
                    </FormField>
                </FlexGroup>

                <FlexGroup extraCssClass="row">
                    <FormField first={!!recentProjects}>
                        <Select value={project} outlined={true} label="All projects" onChange={this.onProjectChange}>
                            {projects}
                        </Select>
                    </FormField>
                </FlexGroup>
            </>
        );
    }

    projectClicked = (id: string, selected: boolean) => {
        if (selected) {
            if (store.timesheets.registration && store.timesheets.registration.data)
                store.timesheets.registration.data.project = id;
        }
    };

    onProjectChange = (value: string) => {
        if (store.timesheets.registration && store.timesheets.registration.data)
            store.timesheets.registration.data.project = value;
    }
}