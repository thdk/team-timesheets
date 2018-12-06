import * as React from 'react';
import { Route } from 'mobx-router';
import { Timesheets } from '../../components/Timesheets';
import { IRootStore } from '../../store';
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
    if (!date) {
        const toDay = new Date();
        date = {
            year: toDay.getFullYear(),
            month: toDay.getMonth() + 1,
            day: toDay.getDate()
        }
    }
    s.router.goTo(routes.overview, date, s);
}

const routeChanged = (route: any, params: IDate, s: IRootStore) => {
    // TODO: don't reload registrations every time
    // they should only be reloaded if the query has been changed
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


