import React from "react";
import { render } from "@testing-library/react";
import { Drawer } from ".";

jest.mock("../../rules");
jest.mock("../../contexts/user-context");
jest.mock("../../contexts/auth-context");
jest.mock("../../contexts/view-context");

jest.mock('../../stores/router-store', () => ({
    useRouterStore: () => ({
        queryParams: {},
    }),
}));

jest.mock('../configs/use-configs');

jest.mock("../../contexts/registration-context", () => ({
    useRegistrationStore: () => ({
        registrationsGroupedByDay: [],
    }),
}));

jest.mock("../../contexts/division-context", () => ({
    useDivisionStore: () => ({
        division: undefined,
        userDivisions: [],
    }),
}));

describe("Drawer", () => {
    it("should render", () => {
        const { asFragment } = render(
            <Drawer />
        );

        expect(asFragment()).toMatchSnapshot();
    });
});
