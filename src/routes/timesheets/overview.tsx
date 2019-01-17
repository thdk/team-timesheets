import * as React from 'react';
import { Route } from 'mobx-router';
import { Timesheets } from '../../components/Timesheets';
import { transaction } from 'mobx';
import { beforeEnter, setNavigationContent, goToRouteWithDate } from '../actions';
import { App } from '../../internal';
import { IRootStore } from '../../stores/RootStore';
import { IViewAction } from '../../stores/ViewStore';
import { IRegistration } from '../../stores/TimesheetsStore';

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

const setActions = (s: IRootStore, alowInserts = false) => {
    const actions: IViewAction[] = [
        {
            action: ids =>  {
                s.view.selection.clear();
                s.timesheets.clipboard.replace(ids ? ids.map(id => [id, true]) : []);
            },
            icon: "file_copy",
            shortKey: { ctrlKey: true, key: "c" },
            selection: s.view.selection,
            contextual: true
        }
    ];

    if (alowInserts) {
        actions.push({
            action: ids =>  {
                if (!ids) return;
                console.log(`Not implemented. Trying to clone registrations:\n${ids!.join("\n")}`);
                const docData = Array.from(s.timesheets.registrations.docs.entries())
                    .filter(d => ids.some(id => d[0] === id && !!d[1].data))
                    .map(d => d[1].data) as IRegistration[];

                s.timesheets.registrations.addAsync(docData);
            },
            icon: "library_add",
            shortKey: { ctrlKey: true, key: "v" },
            selection: s.timesheets.clipboard
        });
    }

    s.view.setActions(actions);
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
            setActions(s, true);
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


