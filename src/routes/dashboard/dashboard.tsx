import * as React from 'react';
import { Route } from 'mobx-router';
import { setNavigationContent } from '../actions';
import { App, IDate } from '../../internal';
import { IRootStore } from '../../stores/root-store';
import Dashboard from '../../pages/dashboard';

const path = "/reports/dashboard";

export const goToDashboard = (s: IRootStore) => {
    s.router.goTo(routes.dashboard, null, s);
}

const routeChanged = (route: Route, _params: IDate, s: IRootStore) => {
    setNavigationContent(s, route, false);
};

const routes = {
    dashboard: new Route({
        path: path,
        component: <App><Dashboard></Dashboard></App>,
        onEnter: (route: Route, params: IDate, s: IRootStore) => {
            routeChanged(route, params, s);
        },
        onParamsChange: routeChanged,
        title: "Reports dashboard",
    })
};

export default routes;


