import { Route } from "mobx-router";
import { App, setNavigationContent } from "../internal";
import * as React from 'react';
import store, { IRootStore } from "../stores/RootStore";
import { Settings } from "../components/Pages/Settings/Settings";
import { IViewAction } from "../stores/ViewStore";
import { IReactionDisposer, reaction, transaction, when, Lambda } from "mobx";
import { canDeleteTask, canDeleteClient, canManageTeams, canDeleteProject, canArchiveProject } from "../rules/rules";

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
            case "projects": {
                const deleteAction: IViewAction =
                {
                    action: () => {
                        const project = store.config.project.get();
                        project && s.config.deleteProject(project.id);
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
                s.config.setSelectedProject();
                s.config.taskId = undefined;
                s.config.clientId = undefined;
                s.view.selection.clear();
            });
            setActions(queryParams.tab, s);
        },
        title: "Settings",
        beforeExit: (_route, _param, s: IRootStore) => {
            transaction(() => {
                s.config.setSelectedProject();
                s.config.taskId = undefined;
                s.config.clientId = undefined;
                s.view.selection.clear();
            });

            reactionDisposer && reactionDisposer();
        }
    })
};

export default routes;
