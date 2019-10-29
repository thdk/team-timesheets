import * as React from "react";

import { observer } from "mobx-react-lite";
import ProjectDetailContainer from "../../containers/projects/detail";

export const ProjectDetailPage = observer(() =>
    <ProjectDetailContainer></ProjectDetailContainer>
);

export default ProjectDetailPage;