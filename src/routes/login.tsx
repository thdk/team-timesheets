import * as React from 'react';
import { Route } from 'mobx-router';
import { Login } from '../components/Login';
import { App, goToOverview, setNavigationContent } from '../internal';
import { getLoggedInUserAsync } from '../Firestorable/Firestorable';
import { IRootStore } from '../stores/RootStore';
import { when } from 'mobx';
import { Doc } from '../Firestorable/Document';

const path = "/login";

export const goToLogin = (s: IRootStore) => {
    s.router.goTo(routes.login, null, s);
}

const routes = {
    login: new Route({
        path,
        component: <App><Login></Login></App>,
        onEnter: (route: Route, _params: any, s: IRootStore) => {
            when(() => (s.user.user instanceof(Doc)), () => goToOverview(s));
            setNavigationContent(route, false);
        },
        title: "Login",
        beforeEnter: (_route: Route, _params: any, s: IRootStore) => {
            return getLoggedInUserAsync().then(() => {
                goToOverview(s);
                return false;
            }, () => true);
        },
    })
};

export default routes;


