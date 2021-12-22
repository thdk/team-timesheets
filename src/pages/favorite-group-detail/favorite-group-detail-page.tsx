import * as React from "react";

import { FavoriteGroupDetailForm } from "../../containers/favorite-groups/detail";

import { FavoritesList } from "../../containers/favorites/list";
import { IViewAction } from "../../stores/view-store";
import { goToFavorites } from "../../routes/favorites/list";
import { useFavoriteGroupStore } from "../../contexts/favorite-context";
import { useRouterStore } from "../../stores/router-store";
import { useViewStore } from "../../contexts/view-context";
import { transaction } from "mobx";
import { observer } from "mobx-react-lite";
import { setTitleForRoute } from "../../internal";

export const FavoriteGroupPage = observer(
    () => {

        const favoriteStore = useFavoriteGroupStore();
        const routerStore = useRouterStore();
        const viewStore = useViewStore();

        React.useEffect(
            () => {
                if (!routerStore.params) {
                    return;
                }
                if (routerStore.params.id) {
                    // TODO: use strong typed params 
                    favoriteStore.setActiveDocumentId(routerStore.params.id.toString());
                }
                else {
                    throw new Error("favorite id is missing in querystring");
                }
            },
        )

        React.useEffect(
            () => {
                const deleteAction: IViewAction = {
                    action: () => {
                        if (favoriteStore.activeDocumentId) {
                            favoriteStore.deleteDocument(
                                favoriteStore.activeDocumentId,
                                {
                                    useFlag: false,
                                },
                            );
                        }
                        goToFavorites(routerStore);
                    },
                    icon: { label: "Delete", content: "delete" },
                    shortKey: { key: "Delete", ctrlKey: true }
                }

                const saveAction: IViewAction = {
                    action: async () => {
                        await favoriteStore.saveFavoriteGroup();
                        goToFavorites(routerStore);
                    },
                    icon: { label: "Save", content: "save" },
                    shortKey: { key: "s", ctrlKey: true }
                }

                transaction(() => {
                    viewStore.setActions([
                        saveAction,
                        deleteAction
                    ]);

                    viewStore.setNavigation({
                        action: async () => {
                            await favoriteStore.saveFavoriteGroup();
                            goToFavorites(routerStore);
                        },
                        icon: { label: "Back", content: "arrow_back" }
                    });

                    if (routerStore.currentRoute) {
                        setTitleForRoute({ view: viewStore }, routerStore.currentRoute);
                    }
                });

                return () => {
                    transaction(() => {
                        favoriteStore.setActiveDocumentId(undefined);
                        viewStore.setNavigation("default");
                        viewStore.setActions([]);
                    });
                };
            },
            [
                favoriteStore,
                routerStore,
                viewStore,
            ]
        );

        return (
            <>
                <div style={{ paddingLeft: "2em", paddingTop: "1em" }}>
                    <h3 className="mdc-typography--subtitle1">
                        Favorite group details
                    </h3>
                </div>

                <FavoriteGroupDetailForm />

                <div style={{ paddingLeft: "2em" }}>
                    <h3 className="mdc-typography--subtitle1">
                        Included registrations
                    </h3>
                </div>
                <hr className="mdc-list-divider" />

                <FavoritesList />

                <hr className="mdc-list-divider" />
            </>
        );
    });
