import * as React from 'react'
import { IProject } from "../../../../common/dist";
import { observer } from "mobx-react-lite";

import { useProjectStore } from "../../../contexts/project-context";

export interface IWithProjectInjectedProps {
    project: Partial<IProject>;
}

export type Props = IWithProjectInjectedProps;

export function withProject<T extends Props = Props>(
    WrappedComponent: React.ComponentType<T>
) {
    const ComponentWithProject = (props: Optionalize<T, IWithProjectInjectedProps>) => {
        const projects = useProjectStore();

        const project = projects.activeDocument;

        return project
            ? <WrappedComponent
                {...({project, ...props} as T)}
            />
            : <></>;
    }

    return observer(ComponentWithProject);
}

export default withProject;