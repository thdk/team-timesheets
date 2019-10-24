import React, { useCallback } from "react";

import withProject, { IWithProjectInjectedProps } from "../with-project";
import ProjectDetail from "./project-detail";
import { observer } from "mobx-react-lite";

type Props = IWithProjectInjectedProps;

const ProjectDetailContainer = observer((props: Props) => {
    const { project } = props;

    const handleIconChanged = useCallback((icon: string) => {
        project.icon = icon;
    }, [project]);

    const handleNameChanged = useCallback((name: string) => {
        project.name = name;
    }, [project]);

    const handleOwnerChanged = useCallback((ownerId: string) => {
        project.createdBy = ownerId;
    }, [project]);

    const { createdBy: ownerId, ...rest } = project;
    return <ProjectDetail
        onIconChanged={handleIconChanged}
        onNameChanged={handleNameChanged}
        onOwnerChanged={handleOwnerChanged}
        ownerId={ownerId}
        {...rest}
    />;
});

export default withProject(ProjectDetailContainer);