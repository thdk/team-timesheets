import { Route } from "mobx-router";
import * as React from 'react';
import { transaction, when } from "mobx";
import { IRootStore } from "../../stores/root-store";
import { IViewAction } from "../../stores/view-store";
import { canDeleteTask, canDeleteClient, canManageTeams } from "../../rules/rules";
import { App } from "../../internal";
import Settings from "../../pages/settings";
import { setNavigationContent } from "../actions";

export type SettingsRouteQueryParams = { tab: SettingsTab };
type SettingsRoute = Route<IRootStore, {}, SettingsRouteQueryParams>;

export const goToSettings = (store: IRootStore, tab: SettingsTab = "preferences") => {
    store.router.goTo(routes.preferences, {}, store, { tab });
}

export type SettingsTab = "tasks" | "preferences" | "clients" | "users" | "teams";

const setActions = (tab: SettingsTab, store: IRootStore) => {
    when(() => store.user.authenticatedUser !== undefined, () => {
        switch (tab) {
            case "tasks": {
                const deleteAction: IViewAction | undefined = canDeleteTask(store.user.authenticatedUser)
                    ? {
                        action: () => {
                            store.view.selection.size && store.config.tasksCollection.deleteAsync(...store.view.selection.keys());
                            store.view.selection.clear();
                        },
                        icon: { label: "Delete", content: "delete" },
                        shortKey: { key: "Delete", ctrlKey: true },
                        contextual: true,
                        selection: store.view.selection,
                    }
                    : undefined;

                store.view.setActions([deleteAction].filter(a => a !== undefined) as IViewAction[]);

                break;
            }
            case "clients": {
                const deleteAction: IViewAction | undefined = canDeleteClient(store.user.authenticatedUser) ?
                    {
                        action: () => {
                            store.view.selection.size && store.config.clientsCollection.deleteAsync(...store.view.selection.keys());
                            store.view.selection.clear();
                        },
                        icon: { label: "Delete", content: "delete" },
                        shortKey: { key: "Delete", ctrlKey: true },
                        contextual: true,
                        selection: store.view.selection,
                    }
                    : undefined;

                store.view.setActions([deleteAction].filter(a => a !== undefined) as IViewAction[]);
                break;
            }
            case "teams": {
                const deleteAction: IViewAction | undefined = canManageTeams(store.user.authenticatedUser) ?
                    {
                        action: () => {
                            store.view.selection.size && store.config.teamsCollection.deleteAsync(...store.view.selection.keys());
                            store.view.selection.clear();
                        },
                        icon: { label: "Delete", content: "delete" },
                        shortKey: { key: "Delete", ctrlKey: true },
                        contextual: true,
                        selection: store.view.selection,
                    }
                    : undefined;

                store.view.setActions([deleteAction].filter(a => a !== undefined) as IViewAction[]);
                break;
            }
            default: {
                store.view.setActions([]);
            }
        }
    });
}

const path = '/settings'
const routes = {
    preferences: new Route<IRootStore, {}, SettingsRouteQueryParams>({
        path,
        component: <App><Settings></Settings></App>,
        onEnter: (route: SettingsRoute, _params, s: IRootStore, queryParams: SettingsRouteQueryParams) => {
            setActions(queryParams.tab, s);
            setNavigationContent(s, route, false);
        },
        onParamsChange: (_route: SettingsRoute, _params, s: IRootStore, queryParams: SettingsRouteQueryParams) => {
            transaction(() => {
                s.config.setTaskId(undefined);
                s.config.clientId = undefined;
                s.view.selection.clear();
            });
            setActions(queryParams.tab, s);
        },
        title: "Settings",
        beforeExit: (_route: SettingsRoute, _param, s: IRootStore) => {
            transaction(() => {
                s.config.setTaskId(undefined);
                s.config.clientId = undefined;
                s.view.selection.clear();
            });
        }
    })
};

export default routes;
