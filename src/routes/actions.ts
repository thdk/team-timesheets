import { Route } from "mobx-router";
import { IDate } from './registrations/overview';
import store, { IRootStore } from "../stores/root-store";
import { transaction } from "mobx";
import { setBackToOverview } from "../internal";
import { useEffect } from "react";
import React from "react";

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

export const setTitleForRoute = (route: Route) => {
    store.view.title = route.title || "";
}

export const Redirect = ({route, params}: {route: Route, params?: {}}) => {

    useEffect(() => {
        store.router.goTo(route, params, store);
    });

    return React.createElement(React.Fragment);
};