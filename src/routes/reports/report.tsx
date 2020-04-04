import * as React from 'react';
import { Route } from 'mobx-router';
import { setNavigationContent, goToRouteWithDate, routeWithDateChanged } from '../actions';
import { App, IDate } from '../../internal';
import { IRootStore } from '../../stores/root-store';
import Reports from '../../pages/export';

const path = "/reports";

export const goToReports = (s: IRootStore, date?: IDate) => {
    goToRouteWithDate(routes.report, s, date, { track: false });
}

const routeChanged = (route: Route, params: IDate, s: IRootStore) => {
    setNavigationContent(s, route, false);
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
    })
};

export default routes;


