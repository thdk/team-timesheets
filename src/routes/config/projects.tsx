import { Route } from "mobx-router";
import { ProjectList } from "../../components/Projects/ProjectList";
import { App, setNavigationContent } from "../../internal";
import * as React from 'react';
import { IRootStore } from "../../stores/RootStore";

export const goToProjects = (s: IRootStore) => {
    s.router.goTo(routes.projects, {}, s);
}

const path = '/config/projects'
const routes = {
    projects: new Route({
        path,
        component: <App><ProjectList></ProjectList></App>,
        onEnter: (route: Route) => {
            setNavigationContent(route, false);
        },
        title: "Projects"
    })
};

export default routes;
