import * as React from "react";

import { observer } from "mobx-react-lite";
import FavoriteDetail from "../../containers/favorite-groups/detail";
import { withAuthentication } from "../../containers/users/with-authentication";
import { RedirectToLogin } from "../../routes/login";

const FavoriteGroupPage = observer(() =>
    <FavoriteDetail></FavoriteDetail>
);

export default withAuthentication(
    FavoriteGroupPage,
    <RedirectToLogin />,
);
