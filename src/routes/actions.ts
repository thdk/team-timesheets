import { Route } from "mobx-router";
import { goToOverview, IDate } from './timesheets/overview';
import { getLoggedInUserAsync } from "../Firestorable/Firestorable";
import store, { IRootStore } from "../stores/RootStore";
import { goToLogin } from "./login";
import { when, transaction } from "mobx";

export const goToRouteWithDate = (route: Route, s: IRootStore, date?: IDate, trackOptions?: { track?: boolean, currentDate?: number }) => {
    const { track = undefined, currentDate = undefined } = trackOptions || {};

    s.view.track = track;
    s.router.goTo(route, date || {
        year: s.view.year,
        month: s.view.month,
        day: s.view.day,
    }, s, { last: currentDate });
}

export const routeWithDateChanged = (_route: Route, params: IDate, s: IRootStore) => {
    transaction(() => {
        s.view.year = +params.year;
        s.view.month = +params.month;
        s.view.day = params.day ? +params.day : undefined;
    });
}

export const setNavigationContent = (route: Route, isChildRoute = true) => {
    if (isChildRoute) setBackToOverview();
    else store.view.setNavigation("default");
    setTitleForRoute(route);
}

export const beforeEnter = (_route: Route, _params: any, s: IRootStore) => {
    return getLoggedInUserAsync().then(() => {
        return when(() => !!s.user.userId)
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