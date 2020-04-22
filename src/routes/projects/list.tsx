import { Route } from "mobx-router";
import * as React from 'react';
import { transaction, when } from "mobx";

import { App, setNavigationContent } from "../../internal";
import { IRootStore } from "../../stores/root-store";
import { IViewAction } from "../../stores/view-store";
import Projects from "../../pages/projects";
import detailRoutes from "./detail";
import { canManageProjects } from "../../rules/rules";

export const goToProjects = (store: IRootStore, tab: ProjectsTab = "active") => {
    store.router.goTo(routes.projects, {}, store, { tab });
}

export type ProjectsTab = "active" | "archived";

const setActions = (tab: ProjectsTab, store: IRootStore) => {
    when(() => store.user.authenticatedUser !== undefined, () => {
        if (!canManageProjects(store.user.authenticatedUser)) {
            return;
        }

        const deleteAction: IViewAction = {
            action: () => {
                store.view.selection.size && store.projects.deleteProjects(...store.view.selection.keys());
                store.view.selection.clear();
            },
            icon: { label: "Delete", content: "delete" },
            shortKey: { key: "Delete", ctrlKey: true },
            contextual: true,
            selection: store.view.selection,
        };

        const actions = [deleteAction] as IViewAction[];

        // reactionDisposer && reactionDisposer();
        switch (tab) {
            case "active":
                const archiveAction: IViewAction = {
                    action: () => {
                        store.projects.archiveProjects(...store.view.selection.keys());
                        store.view.selection.clear();
                    },
                    icon: { label: "Archive", content: "archive" },
                    shortKey: { key: "e" },
                    contextual: true,
                    selection: store.view.selection,
                };

                actions.push(archiveAction);

                break;

            case "archived":
                const unarchiveAction: IViewAction = {
                    action: () => {
                        store.projects.unarchiveProjects(...store.view.selection.keys());
                        store.view.selection.clear();
                    },
                    icon: { label: "Unarchive", content: "unarchive" },
                    contextual: true,
                    shortKey: { key: "e" },
                    selection: store.view.selection,
                };

                actions.push(unarchiveAction);

                break;
        }

        store.view.setActions(actions);
        store.view.setFabs([{
            action: () => {
                store.router.goTo(detailRoutes.newProject, {}, store);
            },
            icon: {
                content: "add",
                label: "Add new project"
            },
            shortKey: {
                key: "a",
            },
        }]);
    });
}

const path = '/projects'
export type ProjectRouteQueryParams = { tab: ProjectsTab };
type ProjectRoute = Route<IRootStore, {}, ProjectRouteQueryParams>;

const routes = {
    projects: new Route({
        path,
        component: <App><Projects></Projects></App>,
        onEnter: (route: ProjectRoute, _params, s: IRootStore, queryParams: { tab: ProjectsTab }) => {
            setActions(queryParams.tab, s);
            setNavigationContent(s, route, false);
        },
        onParamsChange: (_route, _params, s: IRootStore, queryParams: { tab: ProjectsTab }) => {
            transaction(() => {
                s.projects.setProjectId(undefined);
                s.view.selection.clear();
            });
            setActions(queryParams.tab, s);
        },
        title: "Projects",
        beforeExit: (_route, _param, s: IRootStore) => {
            transaction(() => {
                s.projects.setProjectId(undefined);
                s.view.selection.clear();
                s.view.setFabs([]);
                s.view.setActions([]);
            });
        }
    })
};

export default routes;
