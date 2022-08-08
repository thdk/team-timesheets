import * as React from 'react';
import { observer } from 'mobx-react-lite';

import { Select } from '@rmwc/select';
import { IProject } from '../../../../common/dist';
import { useUserStore } from "../../../contexts/user-context";
import { useProjectStore } from "../../../contexts/project-context";

export const ProjectSelect = observer(({
    value,
    onChange,
    label,
}: {
    value: string | undefined,
    onChange(value: string): void,
    label?: string,
}) => {
    const { divisionUser } = useUserStore();
    const projectStore = useProjectStore();

    const onProjectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.currentTarget.value;
        onChange(value);
    }

    const userRecentProjects = divisionUser?.recentProjects || [];


    const recentProjects = userRecentProjects.slice(
        0,
        divisionUser?.numberOfRecentProjects || 5,
    ).reduce((p, c) => {
        const projectData = projectStore.activeProjects.find(p => p.id === c);
        if (projectData) {
            p.push(projectData);
        } else {
            console.log("No project data found for recent project id: " + c)
        }
        return p;
    }, new Array<IProject & { id: string }>());


    const recentProjectItems = recentProjects.length
        // eslint-disable-next-line no-useless-escape
        ? ["\/ Recent projects \/", ...recentProjects, "", "\/ More projects \/"]
        : [""];

    const otherProjectItems = projectStore.activeProjects
        .filter(p => !recentProjects.some(rp => rp.id === p.id));

    const allProjects = [...recentProjectItems, ...otherProjectItems];

    let isCurrentProjectArchived = false;
    // Maybe project is archived? Add it and disable change of project!
    if (value && !allProjects.some(p => typeof p !== "string" && p.id === value)) {
        const archivedProject = projectStore.archivedProjects.find(p => p.id === value);
        if (archivedProject) {
            isCurrentProjectArchived = true;
            allProjects.unshift(archivedProject);
        }
        else {
            console.log("Project of registration not found");
            value = undefined;
        }
    }

    const projects = allProjects.reduce<React.ReactNode[]>((p, c, i) => {
        if (typeof c === "string") {
            p.push(
                <option key={i.toString()} value="" disabled={true}>{c}</option>
            );
        }
        else {
            const { id, name } = c;
            p.push(
                <option value={id} key={id}>{name}</option>
            );
        }

        return p;
    }, []);

    return (
        <Select
            disabled={isCurrentProjectArchived}
            value={value || ""}
            outlined={true}
            label={label || "Project"}
            onChange={onProjectChange}
        >
            {projects}
        </Select>
    );
});
