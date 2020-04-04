import * as React from 'react';
import { observer } from 'mobx-react';

import { Select, SelectOption } from '../../../mdc/select';
import { IProject } from '../../../../common/dist';
import { StoreContext } from '../../../contexts/store-context';

@observer
export default class ProjectSelect extends React.Component {
    declare context: React.ContextType<typeof StoreContext>
    static contextType = StoreContext;

    render() {
        let project = this.context.timesheets.registration ? this.context.timesheets.registration.project : "";

        const userRecentProjects = this.context.user.authenticatedUser ? this.context.user.authenticatedUser.recentProjects : [];

        const recentProjects = userRecentProjects.slice(0, 5).reduce((p, c) => {
            const projectData = this.context.projects.activeProjects.find(p => p.id === c);
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

        const otherProjectItems = this.context.projects.activeProjects
            .filter(p => !recentProjects.some(rp => rp.id === p.id));

        const allProjects = [...recentProjectItems, ...otherProjectItems];

        let isCurrentProjectArchived = false;
        // Maybe project is archived? Add it and disable change of project!
        if (project && !allProjects.some(p => typeof p !== "string" && p.id === project)) {
            const archivedProject = this.context.projects.archivedProjects.find(p => p.id === project);
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
            <Select disabled={isCurrentProjectArchived} value={project} outlined={true} label="Project" onChange={this.onProjectChange}>
                {projects}
            </Select>
        );
    }

    projectClicked = (id: string, selected: boolean) => {
        if (selected) {
            if (this.context.timesheets.registration && this.context.timesheets.registration)
                this.context.timesheets.registration.project = id;
        }
    };

    onProjectChange = (value: string) => {
        if (this.context.timesheets.registration && this.context.timesheets.registration)
            this.context.timesheets.registration.project = value;
    }
}