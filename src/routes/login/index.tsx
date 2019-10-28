import * as React from 'react';
import { Route } from 'mobx-router';
import { IRootStore } from '../../stores/root-store';
import { App, goToOverview } from '../../internal';
import { Login } from '../../components/login';
import { when } from 'mobx';
import { setNavigationContent } from '../actions';
import { getLoggedInUserAsync } from '../../firebase/firebase-utils';
import { auth } from '../../firebase/my-firebase';

const path = "/login";

export const goToLogin = (s: IRootStore) => {
    s.router.goTo(routes.login, null, s);
}

const routes = {
    login: new Route({
        path,
        component: <App><Login></Login></App>,
        onEnter: (route: Route, _params: any, s: IRootStore) => {
            when(() => !!s.user.authenticatedUser, () => goToOverview(s));
            setNavigationContent(route, false);
        },
        title: "Login",
        beforeEnter: (_route: Route, _params: any, s: IRootStore) => {
            return getLoggedInUserAsync(auth).then(() => {
                goToOverview(s);
                return false;
            }, () => true);
        },
    })
};

export default routes;


