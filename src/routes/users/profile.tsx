import * as React from "react";
import { Route, RouterStore } from "mobx-router";

import { App } from "../../internal";
import { IRootStore } from "../../stores/root-store";
import { ProfilePage } from "../../pages/profile";


export type ProfileRouteQueryParams = { tab: ProfileTab };
export type ProfileRoute = Route<IRootStore, {}, ProfileRouteQueryParams>;

export type ProfileTab = "preferences" | "divisions";

export const goToUserProfile = (router: RouterStore<IRootStore>, tab: ProfileTab = "preferences") => {
    router.goTo(routes.userProfile, {}, { tab });
};

const routes = {
    userProfile: new Route<IRootStore>({
        path: '/profile',
        component: <App><ProfilePage /></App>,
        title: "Profile",
    })
};

export default routes;