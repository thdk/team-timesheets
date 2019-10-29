import * as React from 'react';
import { Route } from 'mobx-router';
import { beforeEnter, setNavigationContent } from '../actions';
import { App, IDate } from '../../internal';
import store, { IRootStore } from '../../stores/root-store';
import { Dashboard } from '../../pages/dashboard';
import { canReadUsers } from '../../rules/rules';

const path = "/reports/dashboard";

export const goToDashboard = (s: IRootStore) => {
    s.router.goTo(routes.dashboard, null, s);
}

const routeChanged = (route: Route, _params: IDate, _s: IRootStore) => {
    setNavigationContent(route, false);
};

const routes = {
    dashboard: new Route({
        path: path,
        component: <App><Dashboard></Dashboard></App>,
        onEnter: (route: Route, params: IDate, s: IRootStore) => {
            if (canReadUsers(store.user.authenticatedUser) && !store.user.usersCollection.docs.size) {
                store.user.usersCollection.getDocs();
            }

            routeChanged(route, params, s);
        },
        onParamsChange: routeChanged,
        title: "Reports dashboard",
        beforeEnter
    })
};

export default routes;


