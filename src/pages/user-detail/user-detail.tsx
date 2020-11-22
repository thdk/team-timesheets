import React, { useEffect } from "react";

import { withAuthentication } from "../../containers/users/with-authentication";
import { RedirectToLogin } from "../../routes/login";
import { UserDetail } from "../../containers/users/detail";
import { useUserStore } from "../../contexts/user-context";
import { goToSettings } from "../../routes/settings";
import { useRouterStore } from "../../stores/router-store";

export default withAuthentication(
    () => {
        const user = useUserStore();
        const router = useRouterStore();

        if (!user.selectedUser) {
            goToSettings(router, "users");
        }

        useEffect(() => {
            return () => {
                user.setSelectedUserId(undefined);
            }
        }, [user]);

        return (
            <UserDetail />
        );
    },
    <RedirectToLogin />,
);
