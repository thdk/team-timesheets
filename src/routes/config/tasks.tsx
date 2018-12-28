import { Route } from "mobx-router";
import { App } from "../../internal";
import * as React from 'react';
import { setNavigationContent } from "../actions";
import { IRootStore } from "../../stores/RootStore";
import { IViewAction } from "../../stores/ViewStore";
import { reaction, IReactionDisposer, when } from "mobx";
import { TaskList } from "../../components/Pages/Settings/Tasks/TaskList";

export const goToTasks = (s: IRootStore) => {
    s.router.goTo(routes.tasks, {}, s);
}

let reactionDisposer: IReactionDisposer;

const path = '/config/tasks'
const routes = {
    tasks: new Route({
        path,
        component: <App><TaskList></TaskList></App>,
        onEnter: (route: Route, _param: any, s: IRootStore) => {
            const deleteAction: IViewAction = {
                action: () => {
                    s.config.taskId && s.config.tasks.deleteAsync(s.config.taskId);
                    s.config.taskId = undefined;
                },
                icon: "delete",
                shortKey: { key: "Delete", ctrlKey: true }
            }

            reactionDisposer = reaction(() => s.config.taskId, id => {
                if (id) s.view.setActions([deleteAction]);
                else s.view.setActions([]);
            });

            setNavigationContent(route, false);
        },
        title: "Tasks",
        beforeExit: (_route, _params, s: IRootStore) => {
            s.config.taskId = undefined;

            // needed 'when' to allow reaction to run one more time before disposing it
            when(() => s.config.taskId === undefined, () => {
                reactionDisposer && reactionDisposer();
            });
        }
    })
};

export default routes;
