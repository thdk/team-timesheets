import { Route, RouterStore } from "mobx-router";
import * as React from 'react';
import { transaction, when } from "mobx";

import { App, setNavigationContent } from "../../internal";
import { IRootStore } from "../../stores/root-store";
import { IViewAction } from '../../stores/view-store';
import Projects from "../../pages/projects";
import detailRoutes from "./detail";
import { canManageProjects } from "../../rules";

export const goToProjects = (router: RouterStore<IRootStore>, tab: ProjectsTab = "active") => {
    router.goTo(routes.projects, {}, { tab });
}

export type ProjectsTab = "active" | "archived";

const setActions = (tab: ProjectsTab, store: IRootStore) => {
    when(() => store.user.divisionUser !== undefined, () => {
        if (!canManageProjects(store.user.divisionUser)) {
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

        transaction(async () => {
            // temporary because useEffect unmount callback are called before mobx router on-enter callback
            await Promise.resolve();
            store.view.setActions(actions);
            store.view.setFabs([{
                action: () => {
                    store.router.goTo(detailRoutes.newProject, {});
                },
                icon: {
                    content: "add",
                    label: "New project"
                },
                shortKey: {
                    key: "a",
                },
            }]);
        });
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
                s.projects.setActiveDocumentId(undefined);
                s.view.selection.clear();
            });
            setActions(queryParams.tab, s);
        },
        title: "Projects",
        beforeExit: (_route, _param, s: IRootStore) => {
            transaction(() => {
                s.projects.setActiveDocumentId(undefined);
                s.view.selection.clear();
                s.view.setFabs([]);
                s.view.setActions([]);
            });
        }
    })
};

export default routes;
