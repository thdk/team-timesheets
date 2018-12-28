import { Route } from "mobx-router";
import { App, setNavigationContent, goToOverview } from "../../internal";
import * as React from 'react';
import store, { IRootStore } from "../../stores/RootStore";
import { Settings } from "../../components/Pages/Settings/Settings";
import { IViewAction } from "../../stores/ViewStore";
import { IReactionDisposer, reaction } from "mobx";

export const goToSettings = (tab: SettingsTab = "preferences") => {
    store.router.goTo(routes.preferences, {}, store, {tab});
}

export type SettingsTab = "tasks" | "projects" | "preferences";

let reactionDisposer: IReactionDisposer;

const setActions = (tab: SettingsTab, s: IRootStore) => {
    reactionDisposer && reactionDisposer();
    switch(tab) {
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
        }
    }

}

const path = '/settings'
const routes = {
    preferences: new Route({
        path,
        component: <App><Settings></Settings></App>,
        onEnter: (route: Route, _params, s: IRootStore, queryParams: {tab: SettingsTab}) => {
            setActions(queryParams.tab, s);
            setNavigationContent(route, false);
        },
        onParamsChange: (_route, _params, s: IRootStore, queryParams: {tab: SettingsTab}) => {
            setActions(queryParams.tab, s);
        },
        title: "Settings",
        beforeEnter: (_route: Route, _params: {}, s: IRootStore) => {
            // bug in material chipset component
            // https://github.com/material-components/material-components-web-catalog/issues/176
            // chips not working if displayed on page load
            // Temp sollution redirect to overview if this is the first path of the application
            if (!s.router.currentPath) {
                goToOverview(s);
                return false;
            } else{
                return true;
            }
        },
        beforeExit: ()  => {
            reactionDisposer && reactionDisposer();
        }
    })
};

export default routes;
