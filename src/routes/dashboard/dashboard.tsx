import * as React from 'react';
import { Route, RouterStore } from 'mobx-router';
import { setNavigationContent } from '../actions';
import { App } from '../../internal';
import { IRootStore } from '../../stores/root-store';
import { DashboardPage } from '../../pages/dashboard';

const path = "/reports/dashboard";

export const goToDashboard = (router: RouterStore<IRootStore>) => {
    router.goTo(routes.dashboard);
}

const routeChanged = (route: DashboardRoute, _params: Record<any, never>, s: IRootStore) => {
    setNavigationContent(s, route, false);
};

type DashboardRoute = Route<IRootStore, Record<any, never>>;

const routes = {
    dashboard: new Route({
        path: path,
        component: <App><DashboardPage /></App>,
        onEnter: (route: DashboardRoute, params: Record<any, never>, s: IRootStore) => {
            routeChanged(route, params, s);
        },
        onParamsChange: routeChanged,
        title: "Reports dashboard",
    })
};

export default routes;


