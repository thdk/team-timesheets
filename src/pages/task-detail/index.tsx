import * as React from "react";

import { TaskDetail } from "../../containers/tasks/detail";
import { withAuthentication } from "../../containers/users/with-authentication";
import { RedirectToLogin } from "../../routes/login";

export const TaskDetailPage = withAuthentication(
    TaskDetail,
    <RedirectToLogin />
);
