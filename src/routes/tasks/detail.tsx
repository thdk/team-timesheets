import { Route, RouterStore } from 'mobx-router';
import * as React from 'react';

import { IRootStore } from '../../stores/root-store';
import { App } from '../../internal';
import { TaskDetailPage } from '../../pages/task-detail';

const path = "/taskdetail";

export const goToNewTask = (router: RouterStore<IRootStore>) => {
    router.goTo(routes.newTask, { id: undefined });
};

export const goToTask = (router: RouterStore<IRootStore>, id: string) => {
    router.goTo(routes.taskDetail, { id });
}

const routes = {
    newTask: new Route<IRootStore>({
        path,
        component: <App><TaskDetailPage /></App>,
    }),
    taskDetail: new Route<IRootStore>({
        path: path + '/:id',
        component: <App><TaskDetailPage /></App>,
    })
};

export default routes;

