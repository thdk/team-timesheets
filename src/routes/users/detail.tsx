import * as React from "react";
import { Route } from "mobx-router";

import { App } from "../../internal";
import User from "../../pages/user-detail";
import { IRootStore } from "../../stores/root-store";
import { setTitleForRoute } from "../actions";
import { goToSettings } from "../settings";
import { transaction } from "mobx";
import { IViewAction } from "../../stores/view-store";

type RouteParams = { id?: string };
type UserDetailsRoute = Route<IRootStore, RouteParams>;

const routes = {
    registrationDetail: new Route({
        path: '/user/:id',
        component: <App><User></User></App>,
        title: "Edit user details",
        beforeEnter: (_route: UserDetailsRoute, params: RouteParams, s: IRootStore) => {
            s.user.setSelectedUserId(params.id || s.user.authenticatedUserId);
        },
        onEnter: (route: UserDetailsRoute, _params: RouteParams, s: IRootStore) => {
            const saveAction: IViewAction = {
                action: () => {
                    s.user.saveSelectedUser();
                    goToSettings(s, "users");
                },
                icon: { label: "Save", content: "save" },
                shortKey: { key: "s", ctrlKey: true }
            }

            const deleteAction: IViewAction = {
                action: () => {
                    s.user.selectedUserId && s.user.usersCollection.deleteAsync(s.user.selectedUserId);
                    goToSettings(s, "users");
                },
                icon: { label: "Delete", content: "delete" },
                shortKey: { key: "Delete", ctrlKey: true }
            }

            const save = () => {
                s.user.saveSelectedUser();
            };

            transaction(() => {
                setTitleForRoute(s, route);
                s.view.setNavigation({
                    action: () => {
                        save();
                        goToSettings(s, "users");
                    },
                    icon: { label: "Back", content: "arrow_back" }
                });

                s.view.setActions([saveAction, deleteAction]);
            });

        }
    })
};

export default routes;