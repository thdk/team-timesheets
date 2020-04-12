import * as React from "react";
import FavoriteGroupsMenu from "./favorite-groups-menu-mobx";
import { StoreProvider } from "../../../contexts/store-context";
import { IRootStore } from "../../../stores/root-store";
import { render } from "@testing-library/react";
import { IFavoriteRegistrationGroup } from "../../../../common";

it("should not crash without favorite groups", () => {
    const Test = () => {
        const onSelect = jest.fn();
        return (
            <StoreProvider value={{
                favorites: {
                    groups: []
                }
            } as unknown as IRootStore}>
                <FavoriteGroupsMenu
                    onSelect={onSelect}
                />
            </StoreProvider>
        );
    };

    const { asFragment } = render(<Test />);
    expect(asFragment()).toMatchSnapshot();
});

it("should display favorite groups", () => {
    const Test = () => {
        const onSelect = jest.fn();
        return (
            <StoreProvider value={{
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
            </StoreProvider>
        );
    };

    const { asFragment } = render(<Test />);
    expect(asFragment()).toMatchSnapshot();
});
