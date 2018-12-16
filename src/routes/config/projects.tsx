import { Route } from "mobx-router";
import { ProjectList } from "../../components/Projects/ProjectList";
import { App } from "../../internal";
import * as React from 'react';
import {  onEnter } from "../actions";
import { IRootStore } from "../../stores/RootStore";

export const goToProjects = (s: IRootStore) => {
    s.router.goTo(routes.projects, {}, s);
}

const path = '/config/projects'
const routes = {
    projects: new Route({
        path,
        component: <App><ProjectList></ProjectList></App>,
        onEnter,
        title: "Projects"
    })
} as { projects: Route };

export default routes;
