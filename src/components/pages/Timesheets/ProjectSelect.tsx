import * as React from 'react';
import { observer } from 'mobx-react';

import { FormField } from '../../Layout/form';
import { Select, SelectOption } from '../../../MaterialUI/select';
import store from '../../../stores/RootStore';
import { FlexGroup } from '../../Layout/flex';
import { Doc } from '../../../Firestorable/Document';
import { IProject } from '../../../stores/ConfigStore';

@observer
export default class ProjectSelect extends React.Component {
    render() {
        const project = store.timesheets.registration ? store.timesheets.registration.data!.project : "";

        const userRecentProjects = store.user.user ? store.user.user.data!.recentProjects : [];

        const recentProjects = userRecentProjects.slice(0, 5).reduce((p, c) => {
            const projectData = store.config.projects.docs.get(c);
            if (projectData) {
                p.push(projectData);
            } else {
                console.log("No project data found for recent project id: " + c)
            }
            return p;
        }, new Array<Doc<IProject>>());

        const recentProjectItems = recentProjects.length
            ? ["\/ Recent projects \/", ...recentProjects, "", "\/ More projects \/"]
            : [""];

        const otherProjectItems = Array.from(store.config.projects.docs.values())
            .filter(p => !recentProjects.some(rp => rp.id === p.id));

        const projects = [...recentProjectItems, ...otherProjectItems]
            .reduce((p, c, i) => {
                if (typeof c === "string") {
                    p.push([
                        <SelectOption key={i.toString()} value="" text={c} disabled={true}></SelectOption>
                    ]);
                }
                else {
                    if (c.data) {
                        const { id, data: { name } } = c;
                        p.push(
                            <SelectOption text={name!} value={id} key={id}></SelectOption>
                        );
                    }
                }

                return p;
            }, new Array());

        return (
            <>
                <FlexGroup extraCssClass="row">
                    <FormField>
                        <Select value={project} outlined={true} label="Project" onChange={this.onProjectChange}>
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