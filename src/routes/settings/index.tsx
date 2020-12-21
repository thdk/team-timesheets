import { Route, RouterStore } from "mobx-router";
import * as React from 'react';
import { transaction, when } from "mobx";
import { IRootStore } from "../../stores/root-store";
import { IViewAction } from '../../stores/view-store';
import { canDeleteTask, canDeleteClient, canManageTeams } from "../../rules";
import { App } from "../../internal";
import SettingsPage from "../../pages/settings/settings-page-container";
import { setNavigationContent } from "../actions";
import { goToNewTask } from "../tasks/detail";

export type SettingsRouteQueryParams = { tab: SettingsTab };
type SettingsRoute = Route<IRootStore, {}, SettingsRouteQueryParams>;

export const goToSettings = (router: RouterStore<IRootStore>, tab: SettingsTab = "tasks") => {
    router.goTo(routes.preferences, {}, { tab });
}

export type SettingsTab = "tasks" | "clients" | "users" | "teams";

const setActions = (tab: SettingsTab, store: IRootStore) => {
    when(() => store.user.divisionUser !== undefined, () => {
        switch (tab) {
            case "tasks": {
                const deleteAction: IViewAction | undefined = canDeleteTask(store.user.divisionUser)
                    ? {
                        action: () => {
                            store.view.selection.size && store.tasks.deleteDocuments(
                                {
                                    useFlag: false,
                                },
                                ...store.view.selection.keys()
                            );
                            store.view.selection.clear();
                        },
                        icon: { label: "Delete", content: "delete" },
                        shortKey: { key: "Delete", ctrlKey: true },
                        contextual: true,
                        selection: store.view.selection,
                    }
                    : undefined;

                store.view.setActions([deleteAction].filter(a => a !== undefined) as IViewAction[]);

                store.view.setFabs([
                    {
                        action: () => goToNewTask(store.router),
                        icon: {
                            content: "add",
                            label: "New task",
                        },
                        shortKey: {
                            key: "a",
                        },
                    }
                ])
                break;
            }
            case "clients": {
                const deleteAction: IViewAction | undefined = canDeleteClient(store.user.divisionUser) ?
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
                const deleteAction: IViewAction | undefined = canManageTeams(store.user.divisionUser) ?
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
        component: <App><SettingsPage /></App>,
        onEnter: (route: SettingsRoute, _params, s: IRootStore, queryParams: SettingsRouteQueryParams) => {
            setActions(queryParams.tab, s);
            setNavigationContent(s, route, false);
        },
        onParamsChange: (_route: SettingsRoute, _params, s: IRootStore, queryParams: SettingsRouteQueryParams) => {
            transaction(() => {
                s.tasks.setActiveDocumentId(undefined);
                s.config.clientId = undefined;
                s.view.selection.clear();
            });
            setActions(queryParams.tab, s);
        },
        title: "Settings",
        beforeExit: (_route: SettingsRoute, _param, s: IRootStore) => {
            transaction(() => {
                s.tasks.setActiveDocumentId(undefined);
                s.config.clientId = undefined;
                s.view.selection.clear();
            });
        }
    })
};

export default routes;
