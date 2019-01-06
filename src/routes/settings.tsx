import { Route } from "mobx-router";
import { App, setNavigationContent } from "../internal";
import * as React from 'react';
import store, { IRootStore } from "../stores/RootStore";
import { Settings } from "../components/Pages/Settings/Settings";
import { IViewAction } from "../stores/ViewStore";
import { IReactionDisposer, reaction, transaction } from "mobx";

export const goToSettings = (tab: SettingsTab = "preferences") => {
    store.router.goTo(routes.preferences, {}, store, { tab });
}

export type SettingsTab = "tasks" | "projects" | "preferences";

let reactionDisposer: IReactionDisposer;

const setActions = (tab: SettingsTab, s: IRootStore) => {
    reactionDisposer && reactionDisposer();
    switch (tab) {
        case "tasks": {
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
            break;
        }
        case "projects": {
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
            break;
        }
        default: {
            s.view.setActions([]);
        }
    }

}

const path = '/settings'
const routes = {
    preferences: new Route({
        path,
        component: <App><Settings></Settings></App>,
        onEnter: (route: Route, _params, s: IRootStore, queryParams: { tab: SettingsTab }) => {
            setActions(queryParams.tab, s);
            setNavigationContent(route, false);
        },
        onParamsChange: (_route, _params, s: IRootStore, queryParams: { tab: SettingsTab }) => {
            transaction(() => {
                s.config.projectId = undefined;
                s.config.taskId = undefined;
            });
            setActions(queryParams.tab, s);
        },
        title: "Settings",
        beforeExit: (_route, _param, s: IRootStore) => {
            transaction(() => {
                s.config.projectId = undefined;
                s.config.taskId = undefined;
            });

            reactionDisposer && reactionDisposer();
        }
    })
};

export default routes;
