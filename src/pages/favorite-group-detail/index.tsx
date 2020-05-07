import * as React from "react";

import { FavoriteGroupDetailForm } from "../../containers/favorite-groups/detail";
import { withAuthentication } from "../../containers/users/with-authentication";
import { RedirectToLogin } from "../../routes/login";
import { FavoritesList } from "../../containers/favorites/list";

const FavoriteGroupPage = () => (
        <>
            <div style={{ paddingLeft: "2em", paddingTop: "1em" }}>
                <h3 className="mdc-typography--subtitle1">
                    Favorite group details
            </h3>
            </div>

            <FavoriteGroupDetailForm />

            <div style={{ paddingLeft: "2em" }}>
                <h3 className="mdc-typography--subtitle1">
                    Included registrations
            </h3>
            </div>
            <hr className="mdc-list-divider" />

            <FavoritesList />

            <hr className="mdc-list-divider" />
        </>
    );

export default withAuthentication(
    FavoriteGroupPage,
    <RedirectToLogin />,
);
