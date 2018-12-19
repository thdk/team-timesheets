import { Route } from "mobx-router";
import { goToOverview } from './timesheets/overview';
import { getLoggedInUserAsync } from "../Firestorable/Firestorable";
import store, { IRootStore } from "../stores/RootStore";
import { goToLogin } from "./login";
import { when } from "mobx";
import { Doc } from "../Firestorable/Document";

export const setNavigationContent = (route: Route, isChildRoute = true) => {
    if (isChildRoute) setBackToOverview();
    else store.view.setNavigation("default");
    setTitleForRoute(route);
}

export const beforeEnter = (_route: Route, _params: any, s: IRootStore) => {
    return getLoggedInUserAsync().then(() => {
        return when(() => s.user.user instanceof(Doc))
    }, () => {
        goToLogin(s);
        return false;
    });
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