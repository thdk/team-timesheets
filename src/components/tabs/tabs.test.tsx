import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Tabs } from ".";

describe("Tabs", () => {
    it("should render multiple tabs", () => {
        const {
            getByText,
        } = render(
            <Tabs
                tabData={[
                    {
                        id: "tab-1",
                        tabContent: "Tab content 1",
                        text: "Tab 1",
                        icon: "people",
                    },
                    {
                        id: "tab-2",
                        tabContent: "Tab content 2",
                        text: "Tab 2",
                        icon: "house",
                    },
                    {
                        id: "tab-3",
                        tabContent: "Tab content 3",
                        text: "Tab 3",
                        icon: "phone",
                    },
                ]}
            />
        );

        expect(getByText("Tab 1"));
        expect(getByText("Tab 2"));
        expect(getByText("Tab 3"));
    });

    it("should not render if tabs prop is empty array", () => {
        const {
            asFragment,
        } = render(
            <Tabs
                tabData={[]}
            />
        );

        expect(asFragment).toMatchSnapshot();
    });

    it("should call onTabChange when tab is changed", () => {
        const onTabChange = jest.fn();

        const {
            getByText,
        } = render(
            <Tabs
                tabData={[
                    {
                        id: "tab-1",
                        text: "Tab 1",
                        tabContent: "tab content 1",
                    },
                    {
                        id: "tab-2",
                        text: "Tab 2",
                        tabContent: "tab content 2",
                    },
                ]}
                onTabChange={onTabChange}
            />
        );

        fireEvent.click(getByText("Tab 2"));

        expect(onTabChange).toBeCalledWith("tab-2");
    });

    it("should not render tabs when canOpen() return false", () => {
        const {
            queryByText,
        } = render(
            <Tabs
                tabData={[
                    {
                        id: "tab-1",
                        text: "Tab 1",
                        tabContent: "tab content 1",
                        canOpen: () => false,
                    },
                    {
                        id: "tab-2",
                        text: "Tab 2",
                        tabContent: "tab content 2",
                    },
                ]}
            />
        );

        expect(queryByText("Tab 1")).toBeNull();
    });

    it("should show content for the active tab", () => {
        const {
            getByText,
            queryByText,
        } = render(
            <Tabs
                activeTab="tab-2"
                tabData={[
                    {
                        id: "tab-1",
                        tabContent: "Tab content 1",
                        text: "Tab 1",
                        icon: "people",
                    },
                    {
                        id: "tab-2",
                        tabContent: "Tab content 2",
                        text: "Tab 2",
                        icon: "house",
                    },
                    {
                        id: "tab-3",
                        tabContent: "Tab content 3",
                        text: "Tab 3",
                        icon: "phone",
                    },
                ]}
            />
        );

        expect(getByText("Tab content 2"));
        expect(queryByText("Tab content 1")).toBeNull();
        expect(queryByText("Tab content 3")).toBeNull();
    });

    it("should change tab content when tab is changed", () => {
        const {
            getByText,
            queryByText,
        } = render(
            <Tabs
                activeTab="tab-2"
                tabData={[
                    {
                        id: "tab-1",
                        tabContent: "Tab content 1",
                        text: "Tab 1",
                        icon: "people",
                    },
                    {
                        id: "tab-2",
                        tabContent: "Tab content 2",
                        text: "Tab 2",
                        icon: "house",
                    },
                    {
                        id: "tab-3",
                        tabContent: "Tab content 3",
                        text: "Tab 3",
                        icon: "phone",
                    },
                ]}
            />
        );

        expect(getByText("Tab content 2"));
        expect(queryByText("Tab content 1")).toBeNull();
        expect(queryByText("Tab content 3")).toBeNull();

        fireEvent.click(getByText("Tab 3"));

        expect(getByText("Tab content 3"));
        expect(queryByText("Tab content 1")).toBeNull();
        expect(queryByText("Tab content 2")).toBeNull();
    });
});
