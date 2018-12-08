import * as React from 'react';
import { Route } from 'mobx-router';
import { Timesheets } from '../../components/Timesheets';
import store, { IRootStore } from '../../store';
import { transaction } from 'mobx';
import { setTitleForRoute } from '../actions';
import { App } from '../../internal';

interface IDate {
    year: number;
    month: number;
    day: number;
}

export const path = "/timesheets";

export const goTo = (s: IRootStore, date?: IDate) => {
    s.router.goTo(routes.overview, date || {
        year: store.view.year,
        month: store.view.month,
        day: store.view.day
    }, s);
}

const routeChanged = (route: any, params: IDate, s: IRootStore) => {
    transaction(() => {
        s.view.year = params.year;
        s.view.month = params.month;
        s.view.day = params.day;
    });

    setTitleForRoute(route);
}

const routes = {
    overview: new Route({
        path: path + '/:year/:month/:day',
        component: <App><Timesheets></Timesheets></App>,
        onEnter: routeChanged,
        onParamsChange: routeChanged,
        title: "Overview"
    })
} as { overview: Route };

export default routes;


