import React from "react";
import { render } from "@testing-library/react";
import { Drawer } from ".";

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
        const { asFragment } = render(
            <Drawer />
        );

        expect(asFragment()).toMatchSnapshot();
    });
});
