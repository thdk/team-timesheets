import * as React from "react";

import { withAuthentication } from "../../containers/users/with-authentication";
import { RedirectToLogin } from "../../routes/login";
import { UserDetail } from "../../containers/users/detail";

export default withAuthentication(
    UserDetail,
    <RedirectToLogin />,
);
