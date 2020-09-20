import React, { useMemo } from "react";
import { useEffect } from "react";
import { useViewStore } from "../../contexts/view-context";
import { ITabData, Tabs } from "../../components/tabs";
import { useState } from "react";
import { useUserStore } from "../../contexts/user-context";
import { Preferences } from "../settings/preferences";
import { Box } from "../../components/layout/box";
import { DivisionsList } from "../../containers/divisions/list";
import { withAuthentication } from "../../containers/users/with-authentication";
import { RedirectToLogin } from "../../internal";

export const ProfilePage = withAuthentication(() => {
    const view = useViewStore();

    const { authenticatedUser: user } = useUserStore();

    const [tab, setTab] = useState("preferences");

    useEffect(() => {
        view.title = "User profile";
    }, [view]);

    const tabData: ITabData[] = useMemo(() => [
        {
            id: "preferences",
            text: "Preferences",
            canOpen: () => !!user,
            tabContent: <Preferences />,
            icon: "list_alt",
        },
        {
            id: "division",
            tabContent: <Box><DivisionsList /></Box>,
            text: "My divisions",
            icon: "groups",
        },
    ], [user]);

    return (
        <Tabs
            tabData={tabData}
            activeTab={tab}
            onActivate={setTab}
        />
    );
}, <RedirectToLogin />);
ProfilePage.displayName = "ProfilePage";
