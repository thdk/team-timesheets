import * as React from 'react';
import { observer } from 'mobx-react-lite';

import { Select } from '@rmwc/select';
import { IProject } from '../../../../common/dist';
import { useUserStore } from "../../../contexts/user-context";
import { useProjectStore } from "../../../contexts/project-context";
import { useRegistrationStore } from '../../../contexts/registration-context';


export const ProjectSelect = observer(() => {
    const { divisionUser } = useUserStore();
    const { activeProjects, archivedProjects } = useProjectStore();
    const { activeDocument } = useRegistrationStore();

    const onProjectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.currentTarget.value;

        if (activeDocument && activeDocument)
            activeDocument.project = value;
    }

    let project = activeDocument ? activeDocument.project : "";

    const userRecentProjects = divisionUser ? divisionUser.recentProjects : [];

    const recentProjects = userRecentProjects.slice(0, 5).reduce((p, c) => {
        const projectData = activeProjects.find(p => p.id === c);
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

    const otherProjectItems = activeProjects
        .filter(p => !recentProjects.some(rp => rp.id === p.id));

    const allProjects = [...recentProjectItems, ...otherProjectItems];

    let isCurrentProjectArchived = false;
    // Maybe project is archived? Add it and disable change of project!
    if (project && !allProjects.some(p => typeof p !== "string" && p.id === project)) {
        const archivedProject = archivedProjects.find(p => p.id === project);
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
                <option key={i.toString()} value="" disabled={true}>{c}</option>
            ]);
        }
        else {
            const { id, name } = c;
            p.push(
                <option value={id} key={id}>{name}</option>
            );
        }

        return p;
    }, new Array());

    return (
        <Select
            disabled={isCurrentProjectArchived}
            value={project || ""}
            outlined={true}
            label="Project"
            onChange={onProjectChange}>
            {projects}
        </Select>
    );
});
