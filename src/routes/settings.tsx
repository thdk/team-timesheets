import { Route } from "mobx-router";
import { App, setNavigationContent } from "../internal";
import * as React from 'react';
import store, { IRootStore } from "../stores/RootStore";
import { Settings } from "../components/Pages/Settings/Settings";
import { IViewAction } from "../stores/ViewStore";
import { IReactionDisposer, reaction, transaction, when, Lambda } from "mobx";
import { canDeleteTask, canDeleteProject, canDeleteClient, canArchiveProject } from "../rules/rules";

export const goToSettings = (tab: SettingsTab = "preferences") => {
    store.router.goTo(routes.preferences, {}, store, { tab });
}

export type SettingsTab = "tasks" | "projects" | "preferences" | "clients" | "users" | "teams";

let reactionDisposer: IReactionDisposer | Lambda;

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
                const deleteAction: IViewAction =
                {
                    action: () => {
                        const project = store.config.project.get();
                        project && s.config.projects.deleteAsync(project.id);
                        s.config.setSelectedProject();
                    },
                    icon: { label: "Delete", content: "delete" },
                    shortKey: { key: "Delete", ctrlKey: true }
                };

                const archiveAction: IViewAction = {
                    action: () => {
                        const project = store.config.project.get();
                        if (project) {
                            project.isArchived ? s.config.unarchiveProject() : s.config.archiveProject();
                        }
                    },
                    icon: { label: "Archive", content: "archive" },
                    iconActive: { label: "Unarchive", content: "unarchive" },
                    shortKey: { key: "e" },
                    isActive: () => {
                        const project = store.config.project.get();
                        return (project && project.isArchived) || false;
                    }
                };

                reactionDisposer = s.config.project.observe(change => {

                    const project = change.newValue;

                    const viewActions = [] as IViewAction[];
                    if (project) {
                        if (canDeleteProject(project, s.user.authenticatedUser, s.user.userId)) {
                            viewActions.push(deleteAction);
                        }

                        if (canArchiveProject(project, s.user.authenticatedUser, s.user.userId)) {
                            viewActions.push(archiveAction);
                        }
                    }

                    s.view.setActions(viewActions);
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
                        shortKey: { key: "Delete", ctrlKey: true },
                        contextual: true,
                        selection: store.view.selection,
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
                s.config.setSelectedProject();
                s.config.taskId = undefined;
                s.config.clientId = undefined;
            });
            setActions(queryParams.tab, s);
        },
        title: "Settings",
        beforeExit: (_route, _param, s: IRootStore) => {
            transaction(() => {
                s.config.setSelectedProject();
                s.config.taskId = undefined;
                s.config.clientId = undefined;
            });

            reactionDisposer && reactionDisposer();
        }
    })
};

export default routes;
