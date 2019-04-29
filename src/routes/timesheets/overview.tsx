import * as React from 'react';
import { Route } from 'mobx-router';
import { Timesheets } from '../../components/Timesheets';
import { transaction } from 'mobx';
import { beforeEnter, setNavigationContent, goToRouteWithDate } from '../actions';
import { App } from '../../internal';
import store, { IRootStore } from '../../stores/RootStore';
import { IViewAction } from '../../stores/ViewStore';
import { IRegistration } from '../../../common/dist';

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
            icon: { content: "file_copy", label: "Copy" },
            shortKey: { ctrlKey: true, key: "c" },
            selection: s.view.selection,
            contextual: true
        },
        {
            action: selection => {
                if (!selection) return;

                s.timesheets.deleteRegistrationsAsync(...Array.from(selection.keys()));
                s.view.selection.clear();
            },
            icon: { content: "delete", label: "Delete" },
            shortKey: { key: "Delete", ctrlKey: true },
            selection: s.view.selection,
            contextual: true
        } as IViewAction<IRegistration>
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
            icon: { content: "library_add", label: "Paste" },
            shortKey: { ctrlKey: true, key: "v" },
            selection: s.timesheets.clipboard
        } as IViewAction<IRegistration>);
    }

    else {
        actions.push(
            {
                action: () => {
                    s.timesheets.setRegistrationsGroupedByDaySortOrder(s.timesheets.registrationsGroupedByDaySortOrder * -1)
                },
                icon: { content: "arrow_downward", label: "Sort ascending" },
                iconActive: { content: "arrow_upward", label: "Sort descending" },
                isActive: s.timesheets.registrationsGroupedByDaySortOrder === 1
            } as IViewAction<IRegistration>,
            {
                action: () => {
                    s.timesheets.areGroupedRegistrationsCollapsed = !s.timesheets.areGroupedRegistrationsCollapsed;
                },
                icon: { content: "unfold_more", label: "Unfold groups" },
                iconActive: { content: "unfold_less", label: "Fold groups" },
                isActive: s.timesheets.areGroupedRegistrationsCollapsed === false
            }
        )
    }

    s.view.setActions(actions);
};

const beforeTimesheetExit = (_route: Route, _params: any, s: IRootStore) => {
    transaction(() => {
        s.view.selection.size && s.view.selection.clear();
        s.view.setActions([]);
    });
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
        beforeEnter,
        beforeExit: beforeTimesheetExit
    })
};

export default routes;


