import { Route } from "mobx-router";
import { App, setNavigationContent, goToOverview } from "../../internal";
import * as React from 'react';
import store, { IRootStore } from "../../stores/RootStore";
import { Preferences } from "../../components/Pages/Preferences";

export const goToPreferences = () => {
    store.router.goTo(routes.preferences, {}, store);
}

const path = '/settings/preferences'
const routes = {
    preferences: new Route({
        path,
        component: <App><Preferences></Preferences></App>,
        onEnter: (route: Route) => {
            setNavigationContent(route, false);
        },
        title: "Preferences",
        beforeEnter: (_route: Route, _params: {}, s: IRootStore) => {
            // bug in material chipset component
            // https://github.com/material-components/material-components-web-catalog/issues/176
            // chips not working if displayed on page load
            // Temp sollution redirect to overview if this is the first path of the application
            if (!s.router.currentPath) {
                goToOverview(s);
                return false;
            } else{
                return true;
            }
        }
    })
};

export default routes;
