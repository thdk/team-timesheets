import React from "react";
import { initTestFirestore, deleteFirebaseAppsAsync } from "../../../__tests__/utils/firebase";
import { Store } from "../../../stores/root-store";
import { render, fireEvent } from "@testing-library/react";
import { TopBarActions } from "./top-bar-actions-container";
import { ObservableMap } from "mobx";

const {
    firestore,
    clearFirestoreDataAsync,
} = initTestFirestore("top-bar-actions-test", []);

const store = new Store({
    firestore,
});

jest.mock("../../../contexts/store-context", () => ({
    useStore: () => store,
}));

beforeAll(clearFirestoreDataAsync);

afterAll(() => {
    store.dispose();
    return Promise.all([
        deleteFirebaseAppsAsync(),
    ])
});


describe("TopBarActionsContainer", () => {
    it("should render when there are no actions", () => {
        const { asFragment } = render(<TopBarActions />);

        expect(asFragment()).toMatchSnapshot();
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

        const { getByText } = render(<TopBarActions />);

        expect(getByText("favorite")).toBeDefined();
        expect(getByText("people_border")).toBeDefined();
        store.view.setActions([]);
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

        const { queryByText, getByText, asFragment } = render(<TopBarActions />);

        expect(asFragment()).toMatchSnapshot();
        expect(queryByText("favorite")).toBeNull();
        expect(getByText("people"));

        store.view.setActions([]);
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

        const { queryByText, getByText, asFragment } = render(<TopBarActions />);

        expect(asFragment()).toMatchSnapshot();
        expect(getByText("favorite"));
        expect(queryByText("people")).toBeNull();

        store.view.setActions([]);
        store.view.selection.clear();
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

        const { getByText } = render(<TopBarActions />);

        fireEvent.click(getByText("favorite"));

        expect(action).toBeCalled();

        store.view.setActions([]);
        store.view.selection.clear();
    });
});