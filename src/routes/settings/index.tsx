import { Route } from "mobx-router";
import * as React from 'react';
import { IReactionDisposer, transaction, when, Lambda } from "mobx";
import store, { IRootStore } from "../../stores/root-store";
import { IViewAction } from "../../stores/view-store";
import { canDeleteTask, canDeleteClient, canManageTeams } from "../../rules/rules";
import { App } from "../../internal";
import { Settings } from "../../pages/settings";
import { setNavigationContent } from "../actions";

export const goToSettings = (tab: SettingsTab = "preferences") => {
    store.router.goTo(routes.preferences, {}, store, { tab });
}

export type SettingsTab = "tasks" | "preferences" | "clients" | "users" | "teams";

let reactionDisposer: IReactionDisposer | Lambda;

const setActions = (tab: SettingsTab, s: IRootStore) => {
    when(() => store.user.authenticatedUser !== undefined, () => {
        // reactionDisposer && reactionDisposer();
        switch (tab) {
            case "tasks": {
                const deleteAction: IViewAction | undefined = canDeleteTask(store.user.authenticatedUser)
                    ? {
                        action: () => {
                            s.view.selection.size && s.config.tasks.deleteAsync(...s.view.selection.keys());
                            s.view.selection.clear();
                        },
                        icon: { label: "Delete", content: "delete" },
                        shortKey: { key: "Delete", ctrlKey: true },
                        contextual: true,
                        selection: store.view.selection,
                    }
                    : undefined;

                s.view.setActions([deleteAction].filter(a => a !== undefined) as IViewAction[]);

                break;
            }
            case "clients": {
                const deleteAction: IViewAction | undefined = canDeleteClient(store.user.authenticatedUser) ?
                    {
                        action: () => {
                            s.view.selection.size && s.config.clientsCollection.deleteAsync(...s.view.selection.keys());
                            s.view.selection.clear();
                        },
                        icon: { label: "Delete", content: "delete" },
                        shortKey: { key: "Delete", ctrlKey: true },
                        contextual: true,
                        selection: store.view.selection,
                    }
                    : undefined;

                s.view.setActions([deleteAction].filter(a => a !== undefined) as IViewAction[]);
                break;
            }
            case "teams": {
                const deleteAction: IViewAction | undefined = canManageTeams(store.user.authenticatedUser) ?
                    {
                        action: () => {
                            s.view.selection.size && s.config.teamsCollection.deleteAsync(...s.view.selection.keys());
                            s.view.selection.clear();
                        },
                        icon: { label: "Delete", content: "delete" },
                        shortKey: { key: "Delete", ctrlKey: true },
                        contextual: true,
                        selection: store.view.selection,
                    }
                    : undefined;

                s.view.setActions([deleteAction].filter(a => a !== undefined) as IViewAction[]);
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
                s.config.taskId = undefined;
                s.config.clientId = undefined;
                s.view.selection.clear();
            });
            setActions(queryParams.tab, s);
        },
        title: "Settings",
        beforeExit: (_route, _param, s: IRootStore) => {
            transaction(() => {
                s.config.taskId = undefined;
                s.config.clientId = undefined;
                s.view.selection.clear();
            });

            reactionDisposer && reactionDisposer();
        }
    })
};

export default routes;
