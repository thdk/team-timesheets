import { transaction } from 'mobx';
import { Route } from 'mobx-router';
import * as React from 'react';

import { IRootStore } from '../../stores/root-store';
import { IViewAction } from '../../stores/view-store';
import { goToProjects } from './list';
import { setTitleForRoute } from '../actions';
import { App } from '../../internal';
import ProjectDetailPage from '../../pages/project-detail';
import { IProject } from '../../../common/dist';
import { useEffect } from 'react';
import { useStore } from '../../contexts/store-context';

const path = "/projectdetail";

type Params = { id?: string };

type ProjectDetailRoute = Route<IRootStore, Params, {}>;

export const GoToProject = ({
    id,
}: {
    id?: string,
}) => {
    const store = useStore();

    useEffect(() => {
        store.router.goTo(id ? routes.projectDetail : routes.newProject, { id });
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

const onEnter = (route: ProjectDetailRoute, params: Params, s: IRootStore) => {
    const save = () => {

        const isValidProject = (project?: Partial<IProject> | null): project is IProject => {
            return !!project && !!project.name;
        };

        if (isValidProject(s.projects.activeDocument)) {
            params.id
                ? s.projects.updateDocument(s.projects.activeDocument, params.id)
                : s.projects.addDocument(s.projects.activeDocument);
        }
    };
    const deleteAction: IViewAction = {
        action: () => {
            s.projects.activeDocumentId && s.projects.deleteProjects(s.projects.activeDocumentId);
            goToProjects(s.router);
        },
        icon: { label: "Delete", content: "delete" },
        shortKey: { key: "Delete", ctrlKey: true }
    }

    const saveAction: IViewAction = {
        action: () => {
            save();
            goToProjects(s.router);
        },
        icon: { label: "Save", content: "save" },
        shortKey: { key: "s", ctrlKey: true }
    }

    transaction(() => {
        s.view.setActions([
            saveAction,
            deleteAction
        ]);

        s.view.setNavigation({
            action: () => {
                save();
                goToProjects(s.router);
            },
            icon: { label: "Back", content: "arrow_back" }
        });

        setTitleForRoute(s, route);
    });
};

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
        component: <App><ProjectDetailPage></ProjectDetailPage></App>,
        title: "New project",
        onEnter,
        beforeExit,
        beforeEnter,
    }),
    projectDetail: new Route({
        path: path + '/:id',
        component: <App><ProjectDetailPage /></App>,
        title: "Edit project",
        onEnter,
        beforeExit,
        beforeEnter,
    })
};

export default routes;

