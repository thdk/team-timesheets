import { Route } from "mobx-router";
import { App, setNavigationContent } from "../../internal";
import * as React from 'react';
import { IRootStore } from "../../stores/RootStore";
import { ProjectList } from "../../components/Pages/Settings/Projects/ProjectList";
import { IViewAction } from "../../stores/ViewStore";
import { reaction, IReactionDisposer, when } from "mobx";

export const goToProjects = (s: IRootStore) => {
    s.router.goTo(routes.projects, {}, s);
}

let reactionDisposer: IReactionDisposer;

const path = '/config/projects'
const routes = {
    projects: new Route({
        path,
        component: <App><ProjectList></ProjectList></App>,
        onEnter: (route: Route, _param: any, s: IRootStore) => {
            const deleteAction: IViewAction = {
                action: () => {
                    s.config.projectId && s.config.projects.deleteAsync(s.config.projectId);
                    s.config.projectId = undefined;
                },
                icon: "delete",
                shortKey: { key: "Delete", ctrlKey: true }
            }

            reactionDisposer = reaction(() => s.config.projectId, id => {
                if (id) s.view.setActions([deleteAction]);
                else s.view.setActions([]);
            });
            setNavigationContent(route, false);
        },
        title: "Projects",
        beforeExit: (_route, _param, s: IRootStore) => {
            s.config.projectId = undefined;
            when(() => s.config.projectId === undefined, () => {
                reactionDisposer && reactionDisposer();
            });
        }
    })
};

export default routes;
