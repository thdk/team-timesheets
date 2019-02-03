import * as React from 'react';
import { Route } from 'mobx-router';
import { beforeEnter, setNavigationContent, goToRouteWithDate, routeWithDateChanged } from '../actions';
import { App, IDate } from '../../internal';
import { IRootStore } from '../../stores/RootStore';
import { Reports } from '../../components/Pages/Reports';

const path = "/reports";

export const goToReports = (s: IRootStore, date?: IDate) => {
    goToRouteWithDate(routes.report, s, date, { track: false });
}

const routeChanged = (route: Route, params: IDate, s: IRootStore) => {
    setNavigationContent(route, false);
    routeWithDateChanged(route, params, s);
};

const routes = {
    report: new Route({
        path: path + '/:year/:month',
        component: <App><Reports></Reports></App>,
        onEnter: (route: Route, params: IDate, s: IRootStore) => {
            routeChanged(route, params, s);
        },
        onParamsChange: routeChanged,
        title: "Export timesheet",
        beforeEnter
    })
};

export default routes;


