import React from "react";
import { ViewStore } from "../../../stores/view-store";
import { render, fireEvent } from "@testing-library/react";
import { TopBar } from "./";

const viewStore = new ViewStore();
jest.mock("../../../stores/view-store/use-view-store", () => ({
    useViewStore: () => viewStore,
}));


describe("TopBarContainer", () => {
    beforeAll(() => {
        viewStore.title = "Title";
    });

    it("displays the view title", () => {
        const { getByText } = render(<TopBar />);

        expect(getByText("Title"));
    });

    it("displays number of selected items in contextual mode", () => {
        viewStore.selection.set("foo1", true);
        viewStore.selection.set("foo2", true);
        viewStore.selection.set("foo3", true);
        viewStore.selection.set("foo4", true);

        const { getByText } = render(<TopBar />);

        expect(getByText("4 selected"));

        viewStore.selection.clear();
    });

    it("clears selection when close button is clicked in contextual mode", () => {
        viewStore.selection.set("foo1", true);
        viewStore.selection.set("foo2", true);

        const { getByText } = render(<TopBar />);

        expect(viewStore.selection.size).toBe(2);

        fireEvent.click(getByText("close"));

        expect(viewStore.selection.size).toBe(0);
    });

    it("calls navigation action when menu icon is clicked", () => {
        const action = jest.fn();
        viewStore.setNavigation({
            action,
            icon: {
                content: "menu",
                label: "Menu",
            },
        });

        const { getByText } = render(<TopBar />);

        fireEvent.click(getByText("menu"));

        expect(action).toBeCalled();
    });
});