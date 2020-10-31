import React, { useMemo, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useViewStore } from "../../contexts/view-context";
import { ITabData, Tabs } from "../../components/tabs";
import { useUserStore } from "../../contexts/user-context";
import { Preferences } from "../settings/preferences";
import { withAuthentication } from "../../containers/users/with-authentication";
import { RedirectToLogin } from "../../internal";
import { DivisionsTabContent } from "./division-tab-content";
import { useConfigs } from "../../containers/configs/use-configs";


export const ProfilePage = withAuthentication(observer(() => {
    const view = useViewStore();
    const configs = useConfigs();

    const areDivisionsEnabled = configs.getConfigValue<boolean>("enable-divisions", false) || false;

    const { divisionUser } = useUserStore();

    useEffect(() => {
        view.title = "User profile";
    }, [view]);

    const tabData: ITabData[] = useMemo(() => [
        {
            id: "preferences",
            text: "Preferences",
            canOpen: () => !!divisionUser,
            tabContent: <Preferences />,
            icon: "list_alt",
        },
        {
            id: "division",
            tabContent: <DivisionsTabContent />,
            text: "My divisions",
            icon: "groups",
            canOpen: () => !!divisionUser && areDivisionsEnabled,
        },
    ], [divisionUser, areDivisionsEnabled]);

    return (
        <Tabs
            tabData={tabData}
        />
    );
}), <RedirectToLogin />);
ProfilePage.displayName = "ProfilePage";
