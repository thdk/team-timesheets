import * as React from "react";
import FavoriteGroupsMenu from "./favorite-groups-menu-mobx";
import { StoreContext } from "../../../contexts/store-context";
import { IRootStore } from "../../../stores/root-store";
import { render } from "@testing-library/react";
import { IFavoriteRegistrationGroup } from "../../../../common";

jest.mock("@material/top-app-bar/index", () => ({
    MDCTopAppBar: () => React.Fragment,
}));

jest.mock("@material/icon-button/index", () => ({
    MDCIconButtonToggle: () => React.Fragment,
}));

jest.mock("@material/tab-bar/index", () => ({
    MDCTabBar: () => React.Fragment,
}));

jest.mock("@material/ripple/index", () => ({
    MDCRipple: () => React.Fragment,
}));

jest.mock("@material/switch/index", () => ({
    MDCSwitch: () => React.Fragment,
}));

it("should not crash without favorite groups", () => {
    const Test = () => {
        const onSelect = jest.fn();
        return (
            <StoreContext.Provider value={{
                favorites: {
                    groups: []
                }
            } as unknown as IRootStore}>
                <FavoriteGroupsMenu
                    onSelect={onSelect}
                />
            </StoreContext.Provider>
        );
    };

    const { asFragment } = render(<Test />);
    expect(asFragment()).toMatchSnapshot();
});

it("should display favorite groups", () => {
    const Test = () => {
        const onSelect = jest.fn();
        return (
            <StoreContext.Provider value={{
                favorites: {
                    groups: [
                        {
                            name: "group 1",
                            id: "1",
                            userId: "1"
                        },
                        {
                            name: "group 2",
                            id: "2",
                            userId: "1"
                        } as IFavoriteRegistrationGroup
                    ]
                }
            } as unknown as IRootStore}>
                <FavoriteGroupsMenu
                    onSelect={onSelect}
                />
            </StoreContext.Provider>
        );
    };

    const { asFragment } = render(<Test />);
    expect(asFragment()).toMatchSnapshot();
});
