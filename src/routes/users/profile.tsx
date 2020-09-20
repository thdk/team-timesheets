import * as React from "react";
import { Route, RouterStore } from "mobx-router";

import { App } from "../../internal";
import { IRootStore } from "../../stores/root-store";
import { ProfilePage } from "../../pages/profile";

export const goToUserProfile = (router: RouterStore<IRootStore>) => {
    router.goTo(routes.userProfile);
};

const routes = {
    userProfile: new Route<IRootStore>({
        path: '/profile',
        component: <App><ProfilePage /></App>,
        title: "Profile",
    })
};

export default routes;