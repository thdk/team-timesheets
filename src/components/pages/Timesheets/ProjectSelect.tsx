import * as React from 'react';
import { observer } from 'mobx-react';

import { FormField } from '../../Layout/form';
import { Select, SelectOption } from '../../../mdc/select';
import store from '../../../stores/RootStore';
import { IProject } from '../../../../common/dist';

@observer
export default class ProjectSelect extends React.Component {
    render() {
        let project = store.timesheets.registration ? store.timesheets.registration.project : "";

        const userRecentProjects = store.user.authenticatedUser ? store.user.authenticatedUser.recentProjects : [];

        const recentProjects = userRecentProjects.slice(0, 5).reduce((p, c) => {
            const projectData = store.projects.activeProjects.find(p => p.id === c);
            if (projectData) {
                p.push(projectData);
            } else {
                console.log("No project data found for recent project id: " + c)
            }
            return p;
        }, new Array<IProject & { id: string }>());

        const recentProjectItems = recentProjects.length
            ? ["\/ Recent projects \/", ...recentProjects, "", "\/ More projects \/"]
            : [""];

        const otherProjectItems = store.projects.activeProjects
            .filter(p => !recentProjects.some(rp => rp.id === p.id));

        const allProjects = [...recentProjectItems, ...otherProjectItems];

        let isCurrentProjectArchived = false;
        // Maybe project is archived? Add it and disable change of project!
        if (project && !allProjects.some(p => typeof p !== "string" && p.id === project)) {
            const archivedProject = store.projects.archivedProjects.find(p => p.id === project);
            if (archivedProject) {
                isCurrentProjectArchived = true;
                allProjects.unshift(archivedProject);
            }
            else {
                console.log("Project of registration not found");
                project = undefined;
            }
        }

        const projects = allProjects.reduce((p, c, i) => {
                if (typeof c === "string") {
                    p.push([
                        <SelectOption key={i.toString()} value="" text={c} disabled={true}></SelectOption>
                    ]);
                }
                else {
                    const { id, name } = c;
                    p.push(
                        <SelectOption text={name!} value={id} key={id}></SelectOption>
                    );
                }

                return p;
            }, new Array());

        return (
            <FormField>
                <Select disabled={isCurrentProjectArchived} value={project} outlined={true} label="Project" onChange={this.onProjectChange}>
                    {projects}
                </Select>
            </FormField>
        );
    }

    projectClicked = (id: string, selected: boolean) => {
        if (selected) {
            if (store.timesheets.registration && store.timesheets.registration)
                store.timesheets.registration.project = id;
        }
    };

    onProjectChange = (value: string) => {
        if (store.timesheets.registration && store.timesheets.registration)
            store.timesheets.registration.project = value;
    }
}