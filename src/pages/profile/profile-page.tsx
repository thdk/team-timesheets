import React, { useMemo, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useViewStore } from "../../contexts/view-context";
import { ITabData, Tabs } from "../../components/tabs";
import { useUserStore } from "../../contexts/user-context";
import { Preferences } from "../settings/preferences";
import { withAuthentication } from "../../containers/users/with-authentication";
import { RedirectToLogin } from "../../internal";
import { DivisionsTabContent } from "./division-tab-content";

export const ProfilePage = withAuthentication(observer(() => {
    const view = useViewStore();

    const { divisionUser } = useUserStore();

    const [tab, setTab] = useState("preferences");

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
            canOpen: () => !!divisionUser,
        },
    ], [divisionUser]);

    return (
        <Tabs
            tabData={tabData}
            activeTab={tab}
            onActivate={setTab}
        />
    );
}), <RedirectToLogin />);
ProfilePage.displayName = "ProfilePage";
