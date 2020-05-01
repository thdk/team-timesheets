import { Route } from "mobx-router";
import * as React from 'react';
import { transaction, when } from "mobx";

import { App, setNavigationContent } from "../../internal";
import { IRootStore } from "../../stores/root-store";
import { IViewAction } from "../../stores/view-store";
import Favorites from "../../pages/favorites";

type FavoritesListRoute = Route<IRootStore>;

export const goToFavorites = (store: IRootStore) => {
    store.router.goTo(routes.favorites, undefined, store);
}

const setActions = (s: IRootStore) => {
    when(() => s.user.authenticatedUser !== undefined, () => {

        const deleteAction: IViewAction = {
            action: () => {
                s.view.selection.size && s.favorites.deleteGroups(...s.view.selection.keys());
                s.view.selection.clear();
            },
            icon: { label: "Delete", content: "delete" },
            shortKey: { key: "Delete", ctrlKey: true },
            contextual: true,
            selection: s.view.selection,
        };

        const actions = [deleteAction] as IViewAction[];

        s.view.setActions(actions);
    });
}

const path = '/favorites'
const routes = {
    favorites: new Route({
        path,
        component: <App><Favorites/></App>,
        onEnter: (route: FavoritesListRoute, _params, s: IRootStore) => {
            setActions(s);
            setNavigationContent(s, route, false);
        },
        title: "Favorites",
        beforeExit: (_route, _param, s: IRootStore) => {
            transaction(() => {
                s.favorites.setActiveFavoriteGroupId(undefined);
                s.view.selection.clear();
                s.view.setActions([]);
            });
        }
    })
};

export default routes;
