import React, { useMemo, useState } from 'react';
import { Tab, TabBar } from "@rmwc/tabs";
import { useCallback } from 'react';
import { useEffect } from 'react';

export interface ITabData<T extends string = string> {
    id: T;
    icon?: string;
    text: string;
    canOpen?: () => boolean;
    tabContent: React.ReactNode;
}

const TabButtons = <T extends string>({
    tabs,
    onClick,
}: {
    tabs: ITabData<T>[];
    onClick(id: T): void;
}) => {
    return (
        <>
            {tabs.map(({ icon, id, text }) => (
                <Tab
                    onClick={() => onClick(id)}
                    key={id}
                    icon={icon}
                >
                    {text}
                </Tab>
            ))}
        </>
    );
};

export const Tabs = <T extends string>({
    tabData,
    activeTab,
    onTabChange,
}: {
    tabData: ITabData<T>[];
    activeTab?: T;
    onTabChange?: (id: T) => void;
}) => {
    const validTabs = useMemo(() => {
        return tabData.filter(t => !t.canOpen || t.canOpen());
    }, [tabData]);

    const [tab, setTab] = useState(activeTab);

    useEffect(() => {
        setTab(activeTab);
    }, [activeTab])

    const activeTabIndex = useMemo(
        () => {
            const index = tab
                ? validTabs.findIndex(t => t.id === tab)
                : 0;
            return index === -1
                ? 0
                : index;
        },
        [validTabs, tab],
    );

    const handleOnTabClick = useCallback(
        (id: T) => {
            if (onTabChange) {
                onTabChange(id);
            } else {
                setTab(id);
            }
        },
        [onTabChange],
    );

    if (!validTabs.length) {
        return null;
    }

    return (
        <>
            <TabBar
                activeTabIndex={activeTabIndex}
            >
                <TabButtons
                    tabs={validTabs}
                    onClick={handleOnTabClick}
                />
            </TabBar>
            {validTabs[activeTabIndex].tabContent}
        </>
    );
};
Tabs.displayName = "Tabs";
