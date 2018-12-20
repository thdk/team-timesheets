import * as React from 'react';
import { RoutesConfig, Route } from 'mobx-router';

import { path as parentPath } from './overview';
import { App } from '../../components/App';
import { Registration } from '../../components/Registration';
import { setTitleForRoute, setBackToOverview, beforeEnter } from '../actions';
import { goToOverview } from '../../internal';
import { reaction } from '../../../node_modules/mobx';
import { Doc } from '../../Firestorable/Document';
import store, { IRootStore } from '../../stores/RootStore';

const path = parentPath + "/detail";

export const goToRegistration = (id?: string) => {
    store.router.goTo(id ? routes.registrationDetail : routes.newRegistration, { id }, store);
}

const onEnter = (route: Route, params: { id?: string }, s: IRootStore) => {
    s.timesheets.registration = params.id
        ? s.timesheets.registrations.docs.get(params.id)
        : s.timesheets.getNew();

    // registration not in memory yet, request it
    if (params.id && !s.timesheets.registration) {
        s.timesheets.registrations
            .getAsync(params.id)
            .then(r => s.timesheets.registration = r);
    }

    const deleteAction = {
        action: () => {
            s.timesheets.registration instanceof (Doc) && s.timesheets.delete();
            goToOverview(s);
        },
        icon: "delete",
        isActive: false
    }

    s.view.setActions([
        deleteAction
    ]);

    setBackToOverview(() => s.timesheets.save());
    setTitleForRoute(route);

    const u = reaction(() => s.timesheets.registration, () => {
        // use icon as unique id of action
        s.view.actions.replace([]);
        u();
    });
};

const beforeExit = (_route: Route, _params: any, s: IRootStore) => {
    s.timesheets.registration = {};
    s.view.setNavigation("default");
};

const routes = {
    newRegistration: new Route({
        path,
        component: <App><Registration></Registration></App>,
        title: "New registration",
        onEnter,
        beforeExit,
        beforeEnter
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
