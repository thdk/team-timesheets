import React, { useMemo } from 'react';
import { Tab, TabBar } from "@rmwc/tabs";

import { useUserStore } from "../../contexts/user-context";

export interface ITabData<T extends string = string> {
    id: T;
    icon?: string;
    text: string;
    canOpen?: () => boolean;
    tabContent: React.ReactNode;
}

export const Tabs = <T extends string>({
    tabData,
    activeTab,
    onActivate,
}: {
    tabData: ITabData<T>[];
    activeTab?: T;
    onActivate: (id: T) => void;
}) => {
    const { divisionUser: user } = useUserStore();

    const validTabs = useMemo(() => {
        return tabData.filter(t => !t.canOpen || t.canOpen());
    }, [user, tabData]);


    if (!validTabs.length) return <></>

    const tabs = validTabs.map(({ icon, id, text }) => {
        return <Tab
            onClick={onActivate.bind(null, id)}
            key={id}

            icon={icon}
        >
            {text}
        </Tab>;
    });

    let activeTabIndex = activeTab
        ? validTabs.findIndex(t => t.id === activeTab)
        : 0;

    activeTabIndex = activeTabIndex === -1
        ? 0
        : activeTabIndex;

    return validTabs.length ?
        (
            <>
                <TabBar
                    activeTabIndex={activeTabIndex}
                >
                    {tabs}
                </TabBar>
                {validTabs[activeTabIndex].tabContent}
            </>
        )
        : null;
};
