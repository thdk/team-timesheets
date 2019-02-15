import * as React from 'react';
import { Route } from 'mobx-router';
import { Timesheets } from '../../components/Timesheets';
import { transaction } from 'mobx';
import { beforeEnter, setNavigationContent, goToRouteWithDate } from '../actions';
import { App } from '../../internal';
import store, { IRootStore } from '../../stores/RootStore';
import { IViewAction } from '../../stores/ViewStore';
import { IRegistration } from '../../stores/TimesheetsStore';

export interface IDate {
    year: number;
    month: number;
    day?: number;
}

export const path = "/timesheets";

export const goToOverview = (s: IRootStore, date?: IDate, trackOptions?: { track?: boolean, currentDate?: number }) => {
    let route = routes.monthOverview;
    if ((date && date.day) || (!date && s.view.day)) {
        route = routes.overview;
        trackOptions = { ...trackOptions, currentDate: undefined };
    }

    goToRouteWithDate(route, s, date, trackOptions);
};

const routeChanged = (route: Route, params: IDate, s: IRootStore) => {
    setNavigationContent(route, !!s.view.track, s.view.track && store.view.moment ? { year: store.view.year!, month: store.view.month! } : undefined, params.day ? +params.day : undefined);

    transaction(() => {
        s.view.year = +params.year;
        s.view.month = +params.month;
        s.view.day = params.day ? +params.day : undefined;
    });
};

const setActions = (s: IRootStore, alowInserts = false) => {
    const actions: IViewAction[] = [
        {
            action: selection => {
                s.timesheets.clipboard.replace(selection);
                s.view.selection.clear();
            },
            icon: "file_copy",
            shortKey: { ctrlKey: true, key: "c" },
            selection: s.view.selection,
            contextual: true
        },
        {
            action: selection => {
                if (!selection) return;

                s.timesheets.registrations.deleteAsync(...Array.from(selection.keys()));
                s.view.selection.clear();
            },
            icon: "delete",
            shortKey: { key: "Delete", ctrlKey: true },
            selection: s.view.selection,
            contextual: true
        } as IViewAction<IRegistration>,
    ];

    if (alowInserts) {
        actions.push({
            action: selection => {
                if (!selection) return;

                const docData = Array.from(selection.values())
                    .map(reg => s.timesheets.cloneRegistration(reg)) as IRegistration[];

                s.timesheets.registrations.addAsync(docData).then(() => {
                    // uncomment to clear clipboard on paste
                    // s.timesheets.clipboard.clear();
                });
            },
            icon: "library_add",
            shortKey: { ctrlKey: true, key: "v" },
            selection: s.timesheets.clipboard
        } as IViewAction<IRegistration>);
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
            store.view.track = false;
            routeChanged(route, params, s);
            setActions(s);
        },
        onParamsChange: routeChanged,
        title: "Timesheet",
        beforeEnter
    })
};

export default routes;


