import React from "react";
import { useDivisionStore } from "../../../contexts/division-context";
import { DivisionUsersMenu } from "./division-users-menu";
import { render, waitFor, fireEvent } from "@testing-library/react";
import { IDivision } from "../../../../common/interfaces/IOrganisation";

jest.mock('../../configs/use-configs');
jest.mock('../../../stores/router-store');
jest.mock('../../../contexts/division-context');
jest.mock('../../configs/use-configs');

jest.mock('../../../contexts/user-context');

describe("DivisionUsersMenu", () => {
    const useDivisionStoreMock = (useDivisionStore as jest.Mock<ReturnType<typeof useDivisionStore>>)
    beforeAll(() => {
        useDivisionStoreMock.mockReturnValue(
            {
                userDivisions: [] as (IDivision & { divisionUserId: string })[],
            } as ReturnType<typeof useDivisionStore>
        );
    });

    it("should render", () => {
        const {
            asFragment,
        } = render(
            <DivisionUsersMenu />
        );

        expect(asFragment()).toMatchSnapshot();
    });

    it("should show name of logged in user", async () => {
        const {
            getByText,
        } = render(
            <DivisionUsersMenu />
        );

        await waitFor(() => expect(getByText("Foobar")));
    });

    it("should open menu when account badge is clicked", async () => {
        const {
            getByText,
            container,
        } = render(
            <DivisionUsersMenu />
        );

        expect(container.querySelector(".mdc-menu-surface--open")).toBeNull();

        fireEvent.click(getByText("Foobar"));

        await waitFor(() => expect(container.querySelector(".mdc-menu-surface--open")).not.toBeNull());
    })

    it("should list all user's divisons", async () => {
        useDivisionStoreMock.mockReturnValue(
            {
                userDivisions: [
                    {
                        name: "Division 1",
                        icon: "business",
                        divisionUserId: "div-user-1",
                    },
                    {
                        name: "Division 2",
                        icon: "house",
                        divisionUserId: "div-user-2",
                    }
                ] as (IDivision & { divisionUserId: string })[],
            } as ReturnType<typeof useDivisionStore>
        );

        const {
            getByText,
        } = render(
            <DivisionUsersMenu />
        );

        await waitFor(() => getByText("Division 1"));

        getByText("Division 2");
    });
});
