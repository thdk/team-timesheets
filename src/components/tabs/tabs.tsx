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
    const { authenticatedUser: user } = useUserStore();

    const validTabs = useMemo(() => {
        return tabData.filter(t => !t.canOpen || t.canOpen());
    }, [user]);


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

    const activeTabIndex = activeTab
        ? validTabs.findIndex(t => t.id === activeTab)
        : 0;

    return (
        <>
            <TabBar
                activeTabIndex={activeTabIndex === -1 ? 0 : activeTabIndex}
            >
                {tabs}
            </TabBar>
            {validTabs[activeTabIndex].tabContent}
        </>
    );
};
