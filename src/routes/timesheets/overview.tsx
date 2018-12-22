import * as React from 'react';
import { Route } from 'mobx-router';
import { Timesheets } from '../../components/Timesheets';
import { transaction } from 'mobx';
import { beforeEnter, setNavigationContent } from '../actions';
import { App } from '../../internal';
import { IRootStore } from '../../stores/RootStore';
import { Reports } from '../../components/Pages/Reports';

interface IDate {
    year: number;
    month: number;
    day?: number;
}

export const path = "/timesheets";

export const goToOverview = (s: IRootStore, date?: IDate) => {
    const route = (date && date.day) || (!date && s.view.day) ? routes.overview : routes.monthOverview;

    s.router.goTo(route, date || {
        year: s.view.year,
        month: s.view.month,
        day: s.view.day
    }, s);
}

const routeChanged = (route: Route, params: IDate, s: IRootStore) => {
    setNavigationContent(route, false);
    transaction(() => {
        s.view.year = +params.year;
        s.view.month = +params.month;
        s.view.day = params.day ? +params.day : undefined;
    });
}

const routes = {
    overview: new Route({
        path: path + '/:year/:month/:day',
        component: <App><Timesheets></Timesheets></App>,
        onEnter: (route: Route, params: IDate, s: IRootStore) => {
            routeChanged(route, params, s);
        },
        onParamsChange: routeChanged,
        title: "Timesheet",
        beforeEnter
    }),
    monthOverview: new Route({
        path: path + '/:year/:month',
        component: <App><Reports></Reports></App>,
        onEnter: (route: Route, params: IDate, s: IRootStore) => {
            routeChanged(route, params, s);
        },
        onParamsChange: routeChanged,
        title: "Report",
        beforeEnter
    })
};

export default routes;


