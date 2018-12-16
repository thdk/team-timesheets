import { Route } from "mobx-router";
import { App } from "../../internal";
import * as React from 'react';
import {  onEnter } from "../actions";
import { IRootStore } from "../../stores/RootStore";
import { TaskList } from "../../components/Projects/Tasks/TaskList";

export const goToTasks = (s: IRootStore) => {
    s.router.goTo(routes.tasks, {}, s);
}

const path = '/config/tasks'
const routes = {
    tasks: new Route({
        path,
        component: <App><TaskList></TaskList></App>,
        onEnter,
        title: "Tasks"
    })
};

export default routes;
