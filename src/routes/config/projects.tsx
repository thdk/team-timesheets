import { Route } from "mobx-router";
import { ProjectList } from "../../components/Projects/ProjectList";
import { App } from "../../internal";
import store, { IRootStore } from "../../store";
import * as React from 'react';
import { setTitleForRoute } from "../actions";

export const goToProjects = (s: IRootStore) => {
    s.router.goTo(routes.projects, {}, s);
}

const path = '/config/projects'
const routes = {
    projects: new Route({
        path,
        component: <App><ProjectList></ProjectList></App>,
        onEnter: (route: Route) => {
            setTitleForRoute(route);
            store.config.projects.getDocs();
        },
        title: "Projects"
    })
} as { projects: Route };

export default routes;
