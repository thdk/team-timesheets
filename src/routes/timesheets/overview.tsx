import * as React from 'react';
import { Route } from 'mobx-router';
import { Timesheets } from '../../components/Timesheets';
import { transaction } from 'mobx';
import { beforeEnter, setNavigationContent, goToRouteWithDate } from '../actions';
import { App } from '../../internal';
import store, { IRootStore } from '../../stores/RootStore';

export interface IDate {
    year: number;
    month: number;
    day?: number;
}

export const path = "/timesheets";

export const goToOverview = (s: IRootStore, date?: IDate) => {
    const route = (date && date.day) || (!date && s.view.day) ? routes.overview : routes.monthOverview;

    goToRouteWithDate(route, s, date);
};

const routeChanged = (route: Route, params: IDate, s: IRootStore) => {
    setNavigationContent(route, false);
    transaction(() => {
        s.view.year = +params.year;
        s.view.month = +params.month;
        s.view.day = params.day ? +params.day : undefined;
    });
};

const setActions = (s: IRootStore) => {
    s.view.setActions([
        {
            action: ids => console.log(ids),
            icon: "file_copy",
            shortKey: { ctrlKey: true, key: "s" },
            selection: store.view.selection
        }
    ]);
};

const beforeTimesheetExit = (_route: Route, _params: any, s: IRootStore) => {
    s.view.selection.clear();
};

const routes = {
    overview: new Route({
        path: path + '/:year/:month/:day',
        component: <App><Timesheets></Timesheets></App>,
        onEnter: (route: Route, params: IDate, s: IRootStore) => {
            routeChanged(route, params, s);
            setActions(s);
        },
        onParamsChange: routeChanged,
        title: "Timesheet",
        beforeEnter,
        beforeExit: beforeTimesheetExit
    }),
    monthOverview: new Route({
        path: path + '/:year/:month',
        component: <App><Timesheets></Timesheets></App>,
        onEnter: (route: Route, params: IDate, s: IRootStore) => {
            routeChanged(route, params, s);
            setActions(s);
        },
        onParamsChange: routeChanged,
        title: "Timesheet",
        beforeEnter
    })
};

export default routes;


