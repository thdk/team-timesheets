import path from "path";
import fs from "fs";
import React from "react";
import { deleteFirebaseAppsAsync } from "../../../__tests__/utils/firebase";
import { Store } from "../../../stores/root-store";
import { render, fireEvent } from "@testing-library/react";
import { TopBarActions } from "./top-bar-actions-container";
import { ObservableMap } from "mobx";
import { initializeTestApp, loadFirestoreRules, clearFirestoreData } from "@firebase/rules-unit-testing";
import { StoreContext } from "../../../contexts/store-context";
import { act } from "react-dom/test-utils";

const projectId = "top-bar-actions-test";
const app = initializeTestApp({
    projectId,
});

let store: Store;
const setupAsync = async () => {
    store = new Store({
        firestore: app.firestore(),
    });
};

beforeAll(() => loadFirestoreRules({
    projectId,
    rules: fs.readFileSync(path.resolve(__dirname, "../../../../firestore.rules.test"), "utf8"),
}));

beforeEach(async () => {
    await setupAsync();
});

afterEach(async () => {
    store.dispose();
    await clearFirestoreData({ projectId });
});

afterAll(deleteFirebaseAppsAsync);

describe("TopBarActionsContainer", () => {
    it("should render when there are no actions", () => {
        const { asFragment, unmount } = render(
            <StoreContext.Provider value={store}>
                <TopBarActions />
            </StoreContext.Provider>
        );

        expect(asFragment()).toMatchSnapshot();

        unmount();
    });

    it("should show actions", () => {
        store.view.setActions([
            {
                action: jest.fn(),
                icon: {
                    content: "favorite",
                    label: "Favorite",
                },
            },
            {
                action: jest.fn(),
                icon: {
                    content: "house",
                    label: "House",
                },
                isActive: false,
            },
            {
                action: jest.fn(),
                icon: {
                    content: "save",
                    label: "Save",
                },
                isActive: () => true,
            },
            {
                action: jest.fn(),
                icon: {
                    content: "people",
                    label: "People",
                },
                iconActive: {
                    content: "people_border",
                    label: "People active",
                },
                isActive: true,
            },
            {
                action: jest.fn(),
                icon: {
                    content: "close",
                    label: "Close",
                },
                selection: new ObservableMap(),
            },
        ]);

        const { getByText, unmount } = render(
            <StoreContext.Provider value={store}>
                <TopBarActions />
            </StoreContext.Provider>
        );

        expect(getByText("favorite")).toBeDefined();
        expect(getByText("people_border")).toBeDefined();
        unmount();
    });

    it("should not show contextual actions when there is no selection", () => {
        store.view.setActions([
            {
                action: jest.fn(),
                icon: {
                    content: "favorite",
                    label: "Favorite",
                },
                contextual: true,
            },
            {
                action: jest.fn(),
                icon: {
                    content: "people",
                    label: "People",
                },
                iconActive: {
                    content: "people_border",
                    label: "People active",
                },
                isActive: true,
            },
        ]);

        const { queryByText, getByText, asFragment, unmount } = render(
            <StoreContext.Provider value={store}>
                <TopBarActions />
            </StoreContext.Provider>
        );

        expect(asFragment()).toMatchSnapshot();
        expect(queryByText("favorite")).toBeNull();
        expect(getByText("people"));

        unmount();
    });

    it("should only show contextual actions when there is a selection", () => {
        store.view.setActions([
            {
                action: jest.fn(),
                icon: {
                    content: "favorite",
                    label: "Favorite",
                },
                contextual: true,
            },
            {
                action: jest.fn(),
                icon: {
                    content: "people",
                    label: "People",
                },
                iconActive: {
                    content: "people_border",
                    label: "People active",
                },
                isActive: true,
            },
        ]);

        store.view.selection.set("foo", true);

        const { queryByText, getByText, asFragment, unmount } = render(
            <StoreContext.Provider value={store}>
                <TopBarActions />
            </StoreContext.Provider>
        );

        expect(asFragment()).toMatchSnapshot();
        expect(getByText("favorite"));
        expect(queryByText("people")).toBeNull();

        unmount();
    });

    it("should call the action when clicked", () => {

        const action = jest.fn();
        store.view.setActions([
            {
                action,
                icon: {
                    content: "favorite",
                    label: "Favorite",
                },
            },
        ]);

        const { getByText, unmount } = render(
            <StoreContext.Provider value={store}>
                <TopBarActions />
            </StoreContext.Provider>
        );

        act(() => {
            fireEvent.click(getByText("favorite"));
        });

        expect(action).toBeCalled();

        unmount();
    });
});