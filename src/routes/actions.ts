import React from 'react';
import { Route, QueryParams, RouteParams } from "mobx-router";
import { DateObject } from './registrations/overview';
import { IRootStore } from "../stores/root-store";
import { setBackToOverview } from "../internal";
import { useStore } from "../contexts/store-context";

export const goToRouteWithDate = (route: Route<
    IRootStore,
    DateObject,
    any>, s: Pick<IRootStore, "view" | "router">, date?: DateObject, trackOptions?: { track?: boolean, currentDate?: number }) => {
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
        day: params.day || null,
    });
}

export const setNavigationContent = (
    store: Pick<IRootStore, "view" | "router">,
    route: { title?: string },
    isChildRoute = true,
    targetDate?: DateObject,
    currentDate?: number
) => {
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

export const setTitleForRoute = (
    store: Pick<IRootStore, "view">,
    route: { title?: string },
) => {
    store.view.title = route.title || "";
}

export function Redirect<T extends RouteParams, K extends QueryParams>({ 
    route, 
    params, 
    queryParams 
}: { route: Route<IRootStore, T, K>, params?: T, queryParams?: K }) {
    const store = useStore();

    React.useEffect(() => {
        store.router.goTo(route, params, queryParams);
    }, []);

    return React.createElement(React.Fragment);
}