import * as React from "react";

import { withAuthentication } from "../../containers/users/with-authentication";
import { RedirectToLogin } from "../../routes/login";

import { FavoriteGroupPage } from "./favorite-group-detail-page";


export default withAuthentication(
    FavoriteGroupPage,
    <RedirectToLogin />,
);
