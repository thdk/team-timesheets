import * as React from 'react';
import { RoutesConfig, Route } from 'mobx-router';
import { reaction, transaction } from 'mobx';

import { App } from '../../components/App';
import { Registration } from '../../components/Registration';
import { setTitleForRoute, setBackToOverview, beforeEnter } from '../actions';
import { goToOverview } from '../../internal';
import store, { IRootStore } from '../../stores/RootStore';
import { IViewAction } from '../../stores/ViewStore';

const path = "/timesheetsdetail";

export const goToRegistration = (id?: string) => {
    store.router.goTo(id ? routes.registrationDetail : routes.newRegistration, { id }, store);
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
        beforeEnter: (route: Route, params: any, s: IRootStore) => {
            return beforeEnter(route, params, s)
                .then(() => {
                    s.timesheets.setSelectedRegistrationDefault();

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
