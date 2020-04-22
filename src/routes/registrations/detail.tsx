import * as React from 'react';
import { Route } from 'mobx-router';
import { transaction } from 'mobx';
import moment from 'moment';

import { App, goToOverview, DateObject } from '../../internal';
import Registration from '../../pages/registration-detail';
import { setTitleForRoute } from '../actions';
import { IRootStore } from '../../stores/root-store';
import { IViewAction } from '../../stores/view-store';

const path = "/timesheetsdetail";

type RouteParams = { id?: string };
type QueryParams = { date: string; };
type RegistrationsDetailRoute = Route<IRootStore, RouteParams, QueryParams>;

export const goToRegistration = (store: IRootStore, id?: string) => {
    store.router.goTo(id ? routes.registrationDetail : routes.newRegistration, { id }, store);
};

export const goToNewRegistration = (store: IRootStore, date: moment.Moment) => {
    store.router.goTo(routes.newRegistration, undefined, store, { date: moment(date).format("YYYY-MM-DD") });
};

export const setBackToOverview = (store: IRootStore, action?: () => void, currentDate?: number, targetDate?: DateObject) => {
    store.view.setNavigation({
        action: () => {
            action && action();
            goToOverview(store, targetDate, { track: store.view.track, currentDate });
        },
        icon: { label: "Back", content: "arrow_back" }
    });
}

const onEnter = (route: RegistrationsDetailRoute, params: RouteParams, s: IRootStore) => {
    if (params && params.id) {
        s.timesheets.setSelectedRegistration(params.id);
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

        setBackToOverview(s, () => s.timesheets.saveSelectedRegistration(), s.timesheets.registration && s.timesheets.registration.date!.getDate());
        setTitleForRoute(s, route);
    });
};

const beforeExit = (_route: RegistrationsDetailRoute, _params: RouteParams, s: IRootStore) => {
    s.timesheets.setSelectedRegistration(undefined);
    s.view.setNavigation("default");
};

const routes = {
    newRegistration: new Route({
        path,
        component: <App><Registration></Registration></App>,
        title: "New registration",
        onEnter,
        beforeExit,
        beforeEnter: (_route: RegistrationsDetailRoute, _params: RouteParams, s: IRootStore, queryParams?: { date?: string }) => {
            const { date = undefined } = queryParams || {};
            s.timesheets.setSelectedRegistrationDefault(date ? moment(date) : undefined);
        },
    }),
    registrationDetail: new Route({
        path: path + '/:id',
        component: <App><Registration></Registration></App>,
        title: "Edit registration",
        onEnter,
        beforeExit,
    })
};

export default routes;
