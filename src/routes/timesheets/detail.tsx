import * as React from 'react';
import { RoutesConfig, Route } from 'mobx-router';

import { path as parentPath } from './overview';
import { App } from '../../components/App';
import { Registration } from '../../components/Registration';
import { setTitleForRoute } from '../actions';
import store, { IRootStore } from '../../store';
import { goTo as goToOverview } from '../../internal';
import { reaction } from '../../../node_modules/mobx';

const path = parentPath + "/detail";

export const goToRegistration = (id?: string) => {
    store.router.goTo(id ? routes.registrationDetail : routes.newRegistration, { id }, store);
}

const onEnter = (route: Route, params: { id?: string }, s: IRootStore) => {
    s.registrationsStore.registration = params.id ? s.registrations.docs.get(params.id) : s.registrationsStore.getNew();
    const action = {
        action: () => {
            s.registrationsStore.save();
            goToOverview(s, { day: s.view.day, year: s.view.year, month: s.view.month });
        },
        icon: "save",
        isActive: false
    };
    s.view.setActions([
        action
    ]);
    setTitleForRoute(route);

    const u = reaction(() => s.registrationsStore.registration, () => {
        // use icon as unique id of action
        s.view.actions.replace(s.view.actions.filter(a => a.icon !== action.icon));
        u();
    });
};

const beforeExit = (_route: Route, _params: any, s: IRootStore) => {
    s.registrationsStore.registration = {};
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
        beforeExit
    })
} as RoutesConfig;

export default routes;
