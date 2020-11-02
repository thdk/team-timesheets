import * as React from 'react';
import { Route, RouterStore } from 'mobx-router';
import { transaction } from 'mobx';

import { App, goToOverview, DateObject } from '../../internal';
import Registration from '../../pages/registration-detail';
import { setTitleForRoute } from '../actions';
import { IRootStore } from '../../stores/root-store';
import { IViewAction, ViewStore } from '../../stores/view-store';

const path = "/timesheetsdetail";

type RouteParams = { id?: string };
type QueryParams = { date: string; };
type RegistrationsDetailRoute = Route<IRootStore, RouteParams, QueryParams>;

export const goToRegistration = (router: RouterStore<IRootStore>, id?: string) => {
    router.goTo(id ? routes.registrationDetail : routes.newRegistration, { id });
};

export const goToNewRegistration = (router: RouterStore<IRootStore>) => {
    router.goTo(
        routes.newRegistration,
        undefined,
    );
};

export const setBackToOverview = (
    store: Pick<IRootStore, "view" | "router">,
    action?: () => void, currentDate?: number,
    targetDate?: DateObject,
    navigate?: () => void,
) => {
    store.view.setNavigation({
        action: () => {
            action && action();
            if (navigate) {
                navigate();
            } else {
                goToOverview(store, targetDate, { track: store.view.track, currentDate });
            }
        },
        icon: { label: "Back", content: "arrow_back" }
    });
}

export const setChildNavigation = ({
    view,
    navigateBack,
}: {
    view: ViewStore;
    navigateBack: () => void;
}) => {
    view.setNavigation({
        action: navigateBack,
        icon: { label: "Back", content: "arrow_back" }
    });
}

const onEnter = (route: RegistrationsDetailRoute, params: RouteParams, s: IRootStore) => {
    if (params && params.id) {
        s.timesheets.setSelectedRegistration(params.id);
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

        setBackToOverview(s, () => s.timesheets.saveSelectedRegistration(), s.timesheets.registration && s.timesheets.registration.date!.getDate());
        setTitleForRoute(s, route);
    });
};

const beforeExit = (_route: RegistrationsDetailRoute, _params: RouteParams, s: IRootStore) => {
    s.timesheets.setSelectedRegistration(undefined);
    s.view.setNavigation("default");
};

const routes = {
    newRegistration: new Route({
        path,
        component: <App><Registration></Registration></App>,
        title: "New registration",
        onEnter,
        beforeExit,
    }),
    registrationDetail: new Route({
        path: path + '/:id',
        component: <App><Registration></Registration></App>,
        title: "Edit registration",
        onEnter,
        beforeExit,
    })
};

export default routes;
