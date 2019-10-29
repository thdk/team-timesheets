import React from "react";
import store from "../../../stores/root-store";
import { IProject } from "../../../../common/dist";
import { observer } from "mobx-react-lite";

export interface IWithProjectInjectedProps {
    project: Partial<IProject>;
}

export type Props = IWithProjectInjectedProps;

export function withProject<T extends Props = Props>(
    WrappedComponent: React.ComponentType<T>
) {
    const ComponentWithProject = (props: Optionalize<T, IWithProjectInjectedProps>) => {

        const project = store.projects.project;

        return project
            ? <WrappedComponent
                project={project}
                {...(props as T)}
            />
            : <></>;
    }

    return observer(ComponentWithProject);
}

export default withProject;