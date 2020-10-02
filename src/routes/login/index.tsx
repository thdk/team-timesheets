import * as React from 'react';
import { Route, RouterStore } from 'mobx-router';
import { IRootStore } from '../../stores/root-store';
import { App, goToOverview } from '../../internal';
import Login from '../../containers/login';
import { when } from 'mobx';
import { setNavigationContent, Redirect } from '../actions';

const path = "/login";
type LoginRoute = Route<IRootStore>;

const login = new Route({
    path,
    component: <App><Login /></App>,
    onEnter: (route: LoginRoute, _params: any, s: IRootStore) => {
        when(() => !!s.user.authenticatedUser, () => goToOverview(s));
        setNavigationContent(s, route, false);
    },
    title: "Login",
    beforeEnter: (_route: LoginRoute, _params: any, s: IRootStore) => {
        return s.user.getLoggedInUserAsync().then(() => {
            // TODO: detect requested page so we can redirect to that page when authenticated
            goToOverview(s);
            return false;
        }, () => {
            return true;
        });
    },
});

export const goToLogin = (router: RouterStore<IRootStore>) => {
    router.goTo(login, undefined);
}

export const RedirectToLogin = () => {
    return <Redirect route={login} />;
}

export const loginRoutes = {
    login,
};

export default loginRoutes;

