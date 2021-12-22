import { transaction } from 'mobx';
import { Route, QueryParams, RouterStore } from 'mobx-router';
import * as React from 'react';

import { IRootStore } from '../../stores/root-store';
import { goToFavorites } from './list';
import { setTitleForRoute } from '../actions';
import { App } from '../../internal';
import FavoriteGroupDetailPage from '../../pages/favorite-group-detail';

const path = "/favoritedetail";

type RouteParams = { id?: string };
type FavoriteDetailRoute = Route<IRootStore, RouteParams, QueryParams>;

export const goToFavorite = (router: RouterStore<IRootStore>, id: string) => {
    router.goTo(routes.favoriteDetail, { id });
};

const beforeEnter = (_route: FavoriteDetailRoute, params: RouteParams, s: IRootStore) => {
    if (params.id) {
        s.favorites.setActiveDocumentId(params.id);
    }
    else {
        throw new Error("favorite id is missing in querystring");
    }
}

const onEnter = (route: FavoriteDetailRoute, _params: RouteParams, s: IRootStore) => {
    transaction(() => {
        s.view.setNavigation({
            action: () => {
                s.favorites.saveFavoriteGroup();
                goToFavorites(s.router);
            },
            icon: { label: "Back", content: "arrow_back" }
        });

        setTitleForRoute(s, route);
    });
};

const beforeExit = (_route: FavoriteDetailRoute, _params: RouteParams, s: IRootStore) => {
    transaction(() => {
        s.favorites.setActiveDocumentId(undefined);
        s.view.setNavigation("default");
        s.view.setActions([]);
    });
};

const routes = {
    favoriteDetail: new Route({
        path: path + '/:id',
        component: <App><FavoriteGroupDetailPage /></App>,
        title: "Edit favorite group",
        onEnter,
        beforeExit,
        beforeEnter,
    })
};

export default routes;
