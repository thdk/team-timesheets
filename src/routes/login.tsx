import * as React from 'react';
import { Route } from 'mobx-router';
import { Login } from '../components/Login';
import { IRootStore } from '../store';
import { onEnter } from './actions';
import { App } from '../internal';

const path = "/login";

export const goToLogin = (s: IRootStore) => {
    s.router.goTo(routes.login, s);
}

const routes = {
    login: new Route({
        path,
        component: <App><Login></Login></App>,
        onEnter,
        title: "Login"
    })
};

export default routes;


