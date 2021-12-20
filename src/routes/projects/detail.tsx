import { transaction } from 'mobx';
import { Route } from 'mobx-router';
import * as React from 'react';

import { IRootStore } from '../../stores/root-store';
import { App } from '../../internal';
import ProjectDetailPage from '../../pages/project-detail';
import { useEffect } from 'react';
import { useRouterStore } from '../../stores/router-store';

const path = "/projectdetail";

type Params = { id?: string };

type ProjectDetailRoute = Route<IRootStore, Params, {}>;

export const GoToProject = ({
    id,
}: {
    id?: string,
}) => {
    const router = useRouterStore();

    useEffect(() => {
        router.goTo(id ? routes.projectDetail : routes.newProject, { id });
    }, []);

    return <></>;
};

export const goToNewProject = (store: IRootStore) => {
    store.router.goTo(routes.newProject, { id: undefined });
};

const beforeEnter = (_route: ProjectDetailRoute, params: Params, s: IRootStore) => {
    if (params.id) {
        s.projects.setActiveDocumentId(params.id);
    }
    else {
        s.projects.createNewDocument();
    }
}

const beforeExit = (_route: ProjectDetailRoute, _params: Params, s: IRootStore) => {
    transaction(() => {
        s.projects.setActiveDocumentId(undefined);
        s.view.setNavigation("default");
        s.view.setFabs([]);
        s.view.setActions([]);
    });
};

const routes = {
    newProject: new Route({
        path,
        component: <App><ProjectDetailPage/></App>,
        title: "New project",
        beforeExit,
        beforeEnter,
    }),
    projectDetail: new Route({
        path: path + '/:id',
        component: <App><ProjectDetailPage /></App>,
        title: "Edit project",
        beforeExit,
        beforeEnter,
    })
};

export default routes;

