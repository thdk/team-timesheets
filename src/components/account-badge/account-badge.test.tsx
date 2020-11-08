import React from "react";
import { render } from "@testing-library/react";
import { AccountBadge } from "./";

describe("AccountBadge", () => {
    it("should render", () => {
        const { asFragment } = render(
            <AccountBadge
                name="Foobar"
                email="foobar@example.com"
            />
        );

        expect(asFragment()).toMatchSnapshot();
    });
});