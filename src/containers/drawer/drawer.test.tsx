import React from "react";
import { render } from "@testing-library/react";
import { useViewStore } from "../../contexts/view-context";
import { useUserStore } from "../../contexts/user-context";
import { Drawer } from ".";
import moment from "moment";

jest.mock("../../rules");
jest.mock("../../contexts/user-context");
jest.mock("../../contexts/view-context");

jest.mock('../../stores/router-store', () => ({
    useRouterStore: () => ({
        queryParams: {},
    }),
}));

jest.mock("../../contexts/registration-context", () => ({
    useRegistrationStore: () => ({
        registrationsGroupedByDay: [],
    }),
}));

describe("Drawer", () => {
    it("should render", () => {
        (useViewStore as jest.Mock).mockReturnValue({
            isDrawerOpen: true,
            moment: moment(new Date(2020, 2 ,22)),
        });

        (useUserStore as any).mockReturnValue({
            authenticatedUser: {
                email: "foobar@email.com",
                name: "Foobar",
            }
        });

        const { asFragment } = render(
            <Drawer />
        );

        expect(asFragment()).toMatchSnapshot();
    });
});
