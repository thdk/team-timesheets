import { transaction } from 'mobx';
import { Route, RouterStore } from 'mobx-router';
import * as React from 'react';

import { IRootStore } from '../../stores/root-store';
import { IViewAction } from '../../stores/view-store';
import { setTitleForRoute } from '../actions';
import { App } from '../../internal';
import { ITask } from '../../../common/dist';
import { TaskDetailPage } from '../../pages/task-detail';
import { goToTasks } from './list';

const path = "/taskdetail";

type Params = { id?: string };

type TaskDetailRoute = Route<IRootStore, Params, {}>;

export const goToNewTask = (router: RouterStore<IRootStore>) => {
    router.goTo(routes.newTask, { id: undefined });
};

export const goToTask = (router: RouterStore<IRootStore>, id: string) => {
    router.goTo(routes.taskDetail, { id });
}

const beforeEnter = (_route: TaskDetailRoute, params: Params, s: IRootStore) => {
    if (params.id) {
        s.tasks.setActiveDocumentId(params.id);
    }
    else {
        s.tasks.createNewDocument();
    }
}

const onEnter = (route: TaskDetailRoute, params: Params, s: IRootStore) => {
    const save = () => {

        const isValidTask = (task?: Partial<ITask> | null): task is ITask => {
            return !!task && !!task.name;
        };

        if (isValidTask(s.tasks.activeDocument)) {
            params.id
                ? s.tasks.updateDocument(s.tasks.activeDocument, params.id)
                : s.tasks.addDocument(s.tasks.activeDocument);
        }
    };
    const deleteAction: IViewAction = {
        action: () => {
            s.tasks.activeDocumentId && s.tasks.deleteDocument(s.tasks.activeDocumentId);
            goToTasks(s.router);
        },
        icon: { label: "Delete", content: "delete" },
        shortKey: { key: "Delete", ctrlKey: true }
    }

    const saveAction: IViewAction = {
        action: () => {
            save();
            goToTasks(s.router);
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
                goToTasks(s.router);
            },
            icon: { label: "Back", content: "arrow_back" }
        });

        setTitleForRoute(s, route);
    });
};

const beforeExit = (_route: TaskDetailRoute, _params: Params, s: IRootStore) => {
    transaction(() => {
        s.tasks.setActiveDocumentId(undefined);
        s.view.setNavigation("default");
        s.view.setFabs([]);
        s.view.setActions([]);
    });
};

const routes = {
    newTask: new Route({
        path,
        component: <App><TaskDetailPage /></App>,
        title: "New task",
        onEnter,
        beforeExit,
        beforeEnter,
    }),
    taskDetail: new Route({
        path: path + '/:id',
        component: <App><TaskDetailPage /></App>,
        title: "Edit task",
        onEnter,
        beforeExit,
        beforeEnter,
    })
};

export default routes;

