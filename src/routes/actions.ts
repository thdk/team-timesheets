import { Route } from "mobx-router";
import { goToOverview, IDate } from './timesheets/overview';
import store, { IRootStore } from "../stores/root-store";
import { goToLogin } from "./login";
import { when, transaction } from "mobx";
import { getLoggedInUserAsync } from "../firebase/firebase-utils";
import { auth } from "../firebase/my-firebase";

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

export const setNavigationContent = (route: Route, isChildRoute = true, targetDate?: IDate, currentDate?: number) => {
    if (isChildRoute) {
        setBackToOverview(undefined, currentDate, targetDate);
        store.view.track = true;
    }
    else {
        store.view.setNavigation("default");
        store.view.track = false;
    }
    setTitleForRoute(route);
}

export const beforeEnter = (_route: Route, _params: any, s: IRootStore) => {
    return getLoggedInUserAsync(auth).then(() => {
        return when(() => !!s.user.userId)
    }, () => {
        goToLogin(s);
        return false;
    });
}

export const setTitleForRoute = (route: Route) => {
    store.view.title = route.title || "";
}

export const setBackToOverview = (action?: () => void, currentDate?: number, targetDate?: IDate) => {
    store.view.setNavigation({
        action: () => {
            action && action();
            goToOverview(store, targetDate, { track: store.view.track, currentDate });
        },
        icon: { label: "Back", content: "arrow_back" }
    });
}