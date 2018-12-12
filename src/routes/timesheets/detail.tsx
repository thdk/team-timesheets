import * as React from 'react';
import { RoutesConfig, Route } from 'mobx-router';

import { path as parentPath } from './overview';
import { App } from '../../components/App';
import { Registration } from '../../components/Registration';
import { setTitleForRoute, setBackToOverview } from '../actions';
import store, { IRootStore } from '../../store';
import { goTo as goToOverview } from '../../internal';
import { reaction } from '../../../node_modules/mobx';
import { Doc } from '../../Firestorable/Document';

const path = parentPath + "/detail";

export const goToRegistration = (id?: string) => {
    store.router.goTo(id ? routes.registrationDetail : routes.newRegistration, { id }, store);
}

const onEnter = (route: Route, params: { id?: string }, s: IRootStore) => {
    s.registrationsStore.registration = params.id ? s.registrationsStore.registrations.docs.get(params.id) : s.registrationsStore.getNew();

    if (params.id && !s.registrationsStore.registration) s.registrationsStore.registrations.getAsync(params.id).then(r => {
        s.registrationsStore.registration = r;
    });

    const deleteAction = {
        action: () => {
            s.registrationsStore.registration instanceof (Doc) && s.registrationsStore.registrations.deleteAsync(s.registrationsStore.registration.id);
            goToOverview(s);
        },
        icon: "delete",
        isActive: false
    }

    s.view.setActions([
        deleteAction
    ]);

    setBackToOverview(() => s.registrationsStore.save());
    setTitleForRoute(route);

    const u = reaction(() => s.registrationsStore.registration, () => {
        // use icon as unique id of action
        s.view.actions.replace([]);
        u();
    });
};

const beforeExit = (_route: Route, _params: any, s: IRootStore) => {
    s.registrationsStore.registration = {};
    s.view.setNavigation("default");
};

const beforeEnter = (_route: Route, params: { id?: string }, s: IRootStore) => {
    if (params.id) return s.registrationsStore.registrations.getAsync(params.id);

    // temporary return to overview if params are missing
    // due to bug in mobx-router
    goToOverview(s);

    return false;
};

const routes = {
    newRegistration: new Route({
        path,
        component: <App><Registration></Registration></App>,
        title: "New registration",
        onEnter,
        beforeExit
    }),
    registrationDetail: new Route({
        path: path + '/:id',
        component: <App><Registration></Registration></App>,
        title: "Edit registration",
        onEnter,
        beforeExit,
        // beforeEnter
    })
} as RoutesConfig;

export default routes;
