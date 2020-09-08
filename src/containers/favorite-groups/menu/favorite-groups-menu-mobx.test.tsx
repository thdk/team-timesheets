import * as React from "react";
import FavoriteGroupsMenu from "./favorite-groups-menu-mobx";
import { StoreContext } from "../../../contexts/store-context";
import { IRootStore } from "../../../stores/root-store";
import { render, fireEvent } from "@testing-library/react";
import { IFavoriteRegistrationGroup } from "../../../../common";

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

it("should call onSelect with id of selected group", () => {
    const onSelect = jest.fn();
    const Test = () => {
        return (
            <StoreContext.Provider value={{
                favorites: {
                    groups: [
                        {
                            name: "group 1",
                            id: "group-1",
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

    const { getByText } = render(<Test />);

    fireEvent.click(getByText("group 1"));

    expect(onSelect).toBeCalledWith("group-1");
});
