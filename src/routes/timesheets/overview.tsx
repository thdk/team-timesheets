import * as React from 'react';
import { Route } from 'mobx-router';
import { Timesheets } from '../../components/Timesheets';
import { transaction } from 'mobx';
import { onEnter, beforeEnter } from '../actions';
import { App } from '../../internal';
import { IRootStore } from '../../stores/RootStore';

interface IDate {
    year: number;
    month: number;
    day: number;
}

export const path = "/timesheets";

export const goToOverview = (s: IRootStore, date?: IDate) => {
    s.router.goTo(routes.overview, date || {
        year: s.view.year,
        month: s.view.month,
        day: s.view.day
    }, s);
}

const routeChanged = (route: any, params: IDate, s: IRootStore) => {
    onEnter(route, false);
    transaction(() => {
        s.view.year = params.year;
        s.view.month = params.month;
        s.view.day = params.day;
    });
}

const routes = {
    overview: new Route({
        path: path + '/:year/:month/:day',
        component: <App><Timesheets></Timesheets></App>,
        onEnter: (route: any, params: IDate, s: IRootStore) => {
            routeChanged(route, params, s);
        },
        onParamsChange: routeChanged,
        title: "Overview",
        beforeEnter
    })
} as { overview: Route };

export default routes;


