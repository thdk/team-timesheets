import { Route, RouterStore } from "mobx-router";
import * as React from 'react';
import { transaction } from "mobx";

import { App, setNavigationContent } from "../../internal";
import { IRootStore } from "../../stores/root-store";
import { ProjectsPage } from "../../pages/projects";

export const goToProjects = (router: RouterStore<IRootStore>, tab: ProjectsTab = "active") => {
    router.goTo(routes.projects, {}, { tab });
}

export type ProjectsTab = "active" | "archived";



const path = '/projects'
export type ProjectRouteQueryParams = { tab: ProjectsTab };
type ProjectRoute = Route<IRootStore, {}, ProjectRouteQueryParams>;

const routes = {
    projects: new Route({
        path,
        component: <App><ProjectsPage></ProjectsPage></App>,
        onEnter: (route: ProjectRoute, _params, s: IRootStore) => {
            // setActions(queryParams.tab, s);
            setNavigationContent(s, route, false);
        },
        onParamsChange: (_route, _params, s: IRootStore) => {
            transaction(() => {
                s.projects.setActiveDocumentId(undefined);
                s.view.selection.clear();
            });
            // setActions(queryParams.tab, s);
        },
        title: "Projects",
        beforeExit: (_route, _param, s: IRootStore) => {
            transaction(() => {
                s.projects.setActiveDocumentId(undefined);
                s.view.selection.clear();
                s.view.setFabs([]);
                // s.view.setActions([]);
            });
        }
    })
};

export default routes;
