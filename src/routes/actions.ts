import { Route } from "mobx-router";
import { DateObject } from './registrations/overview';
import { IRootStore } from "../stores/root-store";
import { setBackToOverview } from "../internal";
import * as React from 'react'
import { StoreContext } from "../contexts/store-context";

export const goToRouteWithDate = (route: Route<
    IRootStore,
    DateObject,
    any>, s: IRootStore, date?: DateObject, trackOptions?: { track?: boolean, currentDate?: number }) => {
    const { track = undefined, currentDate = undefined } = trackOptions || {};

    s.view.track = track;
    s.router.goTo(route, {
        year: date ? date.year : s.view.year!,
        month: date ? date.month : s.view.month!,
        day: date ? date.day! : s.view.day!,
    }, { last: currentDate });
}

export const routeWithDateChanged = (_route: Route<IRootStore, any, any>, params: DateObject, s: IRootStore) => {
    s.view.setViewDate({
        year: params.year,
        month: params.month,
        day: params.day || undefined,
    });
}

export const setNavigationContent = (store: IRootStore, route: Route<IRootStore, any, any>, isChildRoute = true, targetDate?: DateObject, currentDate?: number) => {
    if (isChildRoute) {
        setBackToOverview(store, undefined, currentDate, targetDate);
        store.view.track = true;
    }
    else {
        store.view.setNavigation("default");
        store.view.track = false;
    }
    setTitleForRoute(store, route);
}

export const setTitleForRoute = (store: IRootStore, route: Route<IRootStore, any, any>) => {
    store.view.title = route.title || "";
}

export const Redirect = ({ route, params }: { route: Route<IRootStore, any, any>, params?: {} }) => {
    const store = React.useContext(StoreContext);

    React.useEffect(() => {
        store.router.goTo(route, params);
    }, []);

    return React.createElement(React.Fragment);
};