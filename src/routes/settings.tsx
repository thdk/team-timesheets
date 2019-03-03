import { Route } from "mobx-router";
import { App, setNavigationContent } from "../internal";
import * as React from 'react';
import store, { IRootStore } from "../stores/RootStore";
import { Settings } from "../components/Pages/Settings/Settings";
import { IViewAction } from "../stores/ViewStore";
import { IReactionDisposer, reaction, transaction, when } from "mobx";
import { canDeleteTask, canDeleteProject, canDeleteClient } from "../rules/rules";

export const goToSettings = (tab: SettingsTab = "preferences") => {
    store.router.goTo(routes.preferences, {}, store, { tab });
}

export type SettingsTab = "tasks" | "projects" | "preferences" | "clients" | "users";

let reactionDisposer: IReactionDisposer;

const setActions = (tab: SettingsTab, s: IRootStore) => {
    when(() => store.user.authenticatedUser !== undefined, () => {
        // reactionDisposer && reactionDisposer();
        switch (tab) {
            case "tasks": {
                const deleteAction: IViewAction | undefined = canDeleteTask(store.user.authenticatedUser)
                    ? {
                        action: () => {
                            s.config.taskId && s.config.tasks.deleteAsync(s.config.taskId);
                            s.config.taskId = undefined;
                        },
                        icon: { label: "Delete", content: "delete" },
                        shortKey: { key: "Delete", ctrlKey: true }
                    }
                    : undefined;

                reactionDisposer = reaction(() => s.config.taskId, id => {
                    if (id) s.view.setActions([deleteAction].filter(a => a !== undefined) as IViewAction[]);
                    else s.view.setActions([]);
                });
                break;
            }
            case "projects": {
                const deleteAction: IViewAction | undefined =
                    {
                        action: () => {
                            s.config.projectId && s.config.projects.deleteAsync(s.config.projectId);
                            s.config.projectId = undefined;
                        },
                        icon: { label: "Delete", content: "delete" },
                        shortKey: { key: "Delete", ctrlKey: true }
                    };

                reactionDisposer = reaction(() => s.config.projectId, id => {
                    if (id && canDeleteProject(s.config.projects.docs.get(id)!.data!, s.user.authenticatedUser, s.user.userId)) {
                        s.view.setActions([deleteAction].filter(a => a !== undefined) as IViewAction[]);
                    }
                    else s.view.setActions([]);
                });
                break;
            }
            case "clients": {
                const deleteAction: IViewAction | undefined = canDeleteClient(store.user.authenticatedUser) ?
                    {
                        action: () => {
                            s.config.clientId && s.config.clientsCollection.deleteAsync(s.config.clientId);
                            s.config.clientId = undefined;
                        },
                        icon: { label: "Delete", content: "delete" },
                        shortKey: { key: "Delete", ctrlKey: true }
                    }
                    : undefined;

                reactionDisposer = reaction(() => s.config.clientId, id => {
                    if (id) s.view.setActions([deleteAction].filter(a => a !== undefined) as IViewAction[]);
                    else s.view.setActions([]);
                });
                break;
            }
            default: {
                s.view.setActions([]);
            }
        }
    });
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
                s.config.clientId = undefined;
            });
            setActions(queryParams.tab, s);
        },
        title: "Settings",
        beforeExit: (_route, _param, s: IRootStore) => {
            transaction(() => {
                s.config.projectId = undefined;
                s.config.taskId = undefined;
                s.config.clientId = undefined;
            });

            reactionDisposer && reactionDisposer();
        }
    })
};

export default routes;
