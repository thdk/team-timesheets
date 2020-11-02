import * as React from "react";
import copy from "copy-text-to-clipboard";
import { v4 as uuidv4 } from 'uuid';
import cryptoRandomString from 'crypto-random-string';

import { queue } from "../../components/snackbar";
import { withAuthentication } from "../../containers/users/with-authentication";
import { RedirectToLogin } from "../../routes/login";
import { DivisionDetail } from "../../containers/division/detail";
import { useEffect } from "react";
import { useViewStore } from "../../contexts/view-context";
import { useDivisionStore } from "../../contexts/division-context";
import { useUserStore } from "../../contexts/user-context";
import { goToUserProfile } from "../../routes/users/profile";
import { useRouterStore } from "../../stores/router-store";
import { transaction } from "mobx";
import { setChildNavigation, setTitleForRoute } from "../../internal";
import { IViewAction } from "../../stores/view-store";
import { observer } from "mobx-react-lite";

export const DivisionDetailPage = withAuthentication(
    observer(
        () => {
            const divisionStore = useDivisionStore();
            const viewStore = useViewStore();
            const userStore = useUserStore();
            const router = useRouterStore();

            useEffect(
                () => {
                    transaction(() => {
                        if (router.currentRoute) {
                            setChildNavigation({
                                view: viewStore,
                                navigateBack: () => goToUserProfile(router, "divisions"),
                            });
                            setTitleForRoute({
                                view: viewStore
                            },
                                router.currentRoute,
                            );
                        }

                        const actions: IViewAction[] = [
                            {
                                icon: { label: "Save", content: "save" },
                                shortKey: { key: "s", ctrlKey: true },
                                action: async () => {
                                    const {
                                        name,
                                        icon,
                                    } = divisionStore.activeDocument || {};

                                    // validation
                                    if (!name) { return; }

                                    if (divisionStore.activeDocument?.id) {
                                        divisionStore.updateDocument(
                                            {
                                                ...divisionStore.activeDocument,
                                            },
                                            divisionStore.activeDocument?.id,
                                        );
                                    }
                                    else {
                                        const divisionId = uuidv4();
                                        const divisionUserId = uuidv4();
                                        await Promise.all([
                                            divisionStore.collection.addAsync({
                                                name,
                                                icon,
                                                createdBy: userStore.authenticatedUserId!,
                                                id: divisionId,
                                            }, divisionId),
                                            divisionStore.divisionCodesCollection.addAsync({
                                                code: cryptoRandomString({ length: 6, type: 'distinguishable' }),
                                                divisionId,
                                            }),
                                            userStore.divisionUsersCollection.addAsync(
                                                {
                                                    ...userStore.authenticatedUser!,
                                                    divisionId,
                                                    roles: {
                                                        admin: true
                                                    },
                                                },
                                                divisionUserId,
                                            ),
                                        ]);

                                        if (!userStore.authenticatedUser?.divisionUserId) {
                                            userStore.updateAuthenticatedUser({
                                                divisionUserId,
                                                divisionId,
                                            });
                                        }
                                    }

                                    goToUserProfile(router, "divisions");
                                }
                            },
                        ];

                        if (divisionStore.activeDocument?.id) {
                            const divisionId = divisionStore.activeDocument?.id;
                            actions.push(
                                {
                                    icon: {
                                        content: "share",
                                        label: "Get division entry code",
                                    },
                                    action: () => {
                                        divisionStore.divisionCodesCollection.query = ref => ref.where("divisionId", "==", divisionId);
                                        divisionStore.divisionCodesCollection.fetchAsync()
                                            .then(() => {
                                                divisionStore.divisionCodesCollection.docs.forEach(d => {
                                                    queue.notify({
                                                        title: `Division entry code: ${d.data!.code}`,
                                                        dismissesOnAction: true,
                                                        actions: [
                                                            {
                                                                label: 'Copy',
                                                                icon: 'content_copy',
                                                                onClick: () => {
                                                                    copy(d.data!.code);
                                                                },
                                                            },
                                                        ],
                                                    });
                                                })
                                            });
                                    }
                                },
                            )
                        }

                        viewStore.title = router.currentRoute?.title || "";
                        viewStore.setActions(actions);
                    });


                    return () => {
                        viewStore.setActions([]);
                    };
                },
                [
                    viewStore,
                    divisionStore,
                    userStore,
                    divisionStore.activeDocument,
                ],
            );

            useEffect(
                () => {
                    if (router.params?.id === undefined) {
                        divisionStore.createNewDocument();
                    } else {
                        divisionStore.setActiveDocumentId(router.params?.id.toString());
                    }

                    return () => {
                        divisionStore.setActiveDocumentId(undefined);
                    }
                },
                [
                    divisionStore,
                    router,
                ]
            );
            return (
                <DivisionDetail />
            );
        }),
    <RedirectToLogin />,
);
