import * as React from "react";
import { QueryParams, Route, RouterStore } from "mobx-router";

import { App } from "../../internal";
import { IRootStore } from "../../stores/root-store";
import { ProfilePage } from "../../pages/profile";


export type ProfileRouteQueryParams = { tab: ProfileTab };
export type ProfileRoute = Route<IRootStore, QueryParams, ProfileRouteQueryParams>;

export type ProfileTab = "preferences" | "divisions" | "connections";

export const goToUserProfile = (router: RouterStore<IRootStore>, tab: ProfileTab = "preferences") => {
    router.goTo(routes.userProfile, {}, { tab });
};

const routes = {
    userProfile: new Route<IRootStore, any, {
        tab?: ProfileTab,
    }>({
        path: '/profile',
        component: <App><ProfilePage /></App>,
        title: "Profile",
    })
};

export default routes;