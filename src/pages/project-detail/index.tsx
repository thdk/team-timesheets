import * as React from "react";

import { observer } from "mobx-react-lite";
import ProjectDetailContainer from "../../containers/projects/detail";
import { withAuthentication } from "../../containers/users/with-authentication";
import { RedirectToLogin } from "../../routes/login";

const ProjectDetailPage = observer(() =>
    <ProjectDetailContainer></ProjectDetailContainer>
);

export default withAuthentication(
    ProjectDetailPage,
    <RedirectToLogin />,
);
