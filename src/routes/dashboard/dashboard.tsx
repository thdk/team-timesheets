import * as React from 'react';
import { Route, RouterStore } from 'mobx-router';
import { setNavigationContent } from '../actions';
import { App } from '../../internal';
import { IRootStore } from '../../stores/root-store';
import Dashboard from '../../pages/dashboard';

const path = "/reports/dashboard";

export const goToDashboard = (router: RouterStore<IRootStore>) => {
    router.goTo(routes.dashboard);
}

const routeChanged = (route: DashboardRoute, _params: {}, s: IRootStore) => {
    setNavigationContent(s, route, false);
};

type DashboardRoute = Route<IRootStore>;

const routes = {
    dashboard: new Route({
        path: path,
        component: <App><Dashboard></Dashboard></App>,
        onEnter: (route: DashboardRoute, params: {}, s: IRootStore) => {
            routeChanged(route, params, s);
        },
        onParamsChange: routeChanged,
        title: "Reports dashboard",
    })
};

export default routes;


