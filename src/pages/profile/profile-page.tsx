import React, { useMemo, useEffect, useCallback } from "react";
import { observer } from "mobx-react-lite";
import { useViewStore } from "../../contexts/view-context";
import { ITabData, Tabs } from "../../components/tabs";
import { useUserStore } from "../../contexts/user-context";
import { Preferences } from "../settings/preferences";
import { withAuthentication } from "../../containers/users/with-authentication";
import { RedirectToLogin } from "../../internal";
import { DivisionsTabContent } from "./division-tab-content";
import { useConfigs } from "../../containers/configs/use-configs";
import { goToUserProfile, ProfileTab, ProfileRouteQueryParams } from "../../routes/users/profile";
import { useRouterStore } from "../../stores/router-store";

export const ProfilePage = withAuthentication(observer(() => {
    const view = useViewStore();
    const configs = useConfigs();
    const router = useRouterStore();

    const areDivisionsEnabled = configs.getConfigValue<boolean>("enable-divisions", false) || false;

    const { divisionUser } = useUserStore();

    useEffect(() => {
        view.title = "User profile";
    }, [view]);

    const tabData: ITabData<ProfileTab>[] = useMemo(() => [
        {
            id: "preferences",
            text: "Preferences",
            canOpen: () => !!divisionUser,
            tabContent: <Preferences />,
            icon: "list_alt",
        },
        {
            id: "divisions",
            tabContent: <DivisionsTabContent />,
            text: "My divisions",
            icon: "groups",
            canOpen: () => !!divisionUser && areDivisionsEnabled,
        },
    ], [divisionUser, areDivisionsEnabled]);

    const onTabChange = useCallback((tabId: ProfileTab) => {
        goToUserProfile(router, tabId);
    }, [goToUserProfile, router]);

    const query: { tab: ProfileTab } = router.queryParams as ProfileRouteQueryParams;
    const { tab: activeTab = undefined } = query || {};

    return (
        <Tabs
            tabData={tabData}
            activeTab={activeTab}
            onTabChange={onTabChange}
        />
    );
}), <RedirectToLogin />);
ProfilePage.displayName = "ProfilePage";
