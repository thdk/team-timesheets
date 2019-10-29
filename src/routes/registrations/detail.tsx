import * as React from 'react';
import { RoutesConfig, Route } from 'mobx-router';
import { reaction, transaction } from 'mobx';

import { App, goToOverview, IDate } from '../../internal';
import { Registration } from '../../pages/registration-detail';
import { setTitleForRoute, beforeEnter } from '../actions';
import store, { IRootStore } from '../../stores/root-store';
import { IViewAction } from '../../stores/view-store';
import moment from 'moment';

const path = "/timesheetsdetail";

export const goToRegistration = (id?: string) => {
    store.router.goTo(id ? routes.registrationDetail : routes.newRegistration, { id }, store);
};

export const goToNewRegistration = (date: moment.Moment) => {
    store.router.goTo(routes.newRegistration, { id: undefined }, store, { date: moment(date).format("YYYY-MM-DD") });
};

export const setBackToOverview = (action?: () => void, currentDate?: number, targetDate?: IDate) => {
    store.view.setNavigation({
        action: () => {
            action && action();
            goToOverview(store, targetDate, { track: store.view.track, currentDate });
        },
        icon: { label: "Back", content: "arrow_back" }
    });
}

const onEnter = (route: Route, params: { id?: string }, s: IRootStore) => {
    if (params.id) {
        s.timesheets.setSelectedRegistrationId(params.id);
    }

    const deleteAction: IViewAction = {
        action: () => {
            s.timesheets.registrationId && s.timesheets.deleteRegistrationsAsync(s.timesheets.registrationId);
            goToOverview(s);
        },
        icon: { label: "Delete", content: "delete" },
        shortKey: { key: "Delete", ctrlKey: true }
    }

    const saveAction: IViewAction = {
        action: () => {
            s.timesheets.saveSelectedRegistration();
            goToOverview(s);
        },
        icon: { label: "Save", content: "save" },
        shortKey: { key: "s", ctrlKey: true }
    }

    transaction(() => {
        s.view.setActions([
            saveAction,
            deleteAction
        ]);

        setBackToOverview(() => s.timesheets.saveSelectedRegistration(), s.timesheets.registration && s.timesheets.registration.date!.getDate());
        setTitleForRoute(route);
    });

    const u = reaction(() => s.timesheets.registration, reg => {
        if (!reg) {
            s.view.actions.replace([]);
            u();
        }
    });
};

const beforeExit = (_route: Route, _params: any, s: IRootStore) => {
    s.timesheets.setSelectedRegistrationId(undefined);
    s.view.setNavigation("default");
};

const routes = {
    newRegistration: new Route({
        path,
        component: <App><Registration></Registration></App>,
        title: "New registration",
        onEnter,
        beforeExit,
        beforeEnter: (route: Route, params: {}, s: IRootStore, queryParams?: { date?: string }) => {
            return beforeEnter(route, params, s)
                .then(() => {
                    const { date = undefined } = queryParams || {};
                    s.timesheets.setSelectedRegistrationDefault(date ? moment(date) : undefined);

                    return true;
                })
        }
    }),
    registrationDetail: new Route({
        path: path + '/:id',
        component: <App><Registration></Registration></App>,
        title: "Edit registration",
        onEnter,
        beforeExit,
        beforeEnter
    })
} as RoutesConfig;

export default routes;
