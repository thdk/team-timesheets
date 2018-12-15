import * as React from 'react';
import { Route } from 'mobx-router';
import { Login } from '../components/Login';
import { onEnter } from './actions';
import { App, goToOverview } from '../internal';
import { getLoggedInUserAsync } from '../Firestorable/Firestorable';
import { reaction } from 'mobx';
import store, { IRootStore } from '../stores/RootStore';

const path = "/login";

export const goToLogin = (s: IRootStore) => {
    s.router.goTo(routes.login, null, s);
}

const routes = {
    login: new Route({
        path,
        component: <App><Login></Login></App>,
        onEnter,
        title: "Login",
        beforeEnter: (_route: Route, _params: any, s: IRootStore) => {
            return getLoggedInUserAsync().then(() => {
                goToOverview(s);
                return false;
            }, () => true);
        }
    })
};

reaction(() => store.user.user, user => user ? goToOverview(store) : goToLogin(store), { fireImmediately: true });

export default routes;


