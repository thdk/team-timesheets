import { Route } from "mobx-router";
import { goToOverview } from './timesheets/overview';
import { getLoggedInUserAsync } from "../Firestorable/Firestorable";
import store from "../stores/RootStore";

export const setNavigationContent = (route: Route, isChildRoute = true) => {
    if (isChildRoute) setBackToOverview();
    else store.view.setNavigation("default");
    setTitleForRoute(route);
}

export const beforeEnter = () => {
    return getLoggedInUserAsync().then(() => true, () => false);
}

export const setTitleForRoute = (route: Route) => {
    store.view.title = route.title || "";
}

export const setBackToOverview = (action?: () => void) => {
    store.view.setNavigation({
        action: () => {
            action && action();
            goToOverview(store);
        },
        icon: "arrow_back"
    });
}