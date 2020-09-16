import React from "react";
import { render } from "@testing-library/react";
import { AccountBadge } from "./account-badge";

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