import React from "react";
import { render, screen } from "@testing-library/react";
import { useUserStore } from "../../../contexts/user-context";
import { useUserStoreMock } from "../../../contexts/user-context/__mocks__";
import { ProjectPreferences } from "./project-preferences";

jest.mock('../../../contexts/user-context');
jest.mock('../../../contexts/auth-context');

const resetMocks = () => {
    (useUserStore as jest.Mock<ReturnType<typeof useUserStore>>).mockReturnValue(
        useUserStoreMock
    );
}

beforeEach(resetMocks);
afterAll(resetMocks);

describe("ProjectPreferences", () => {
    it("should not render without authenticated user", () => {
        (useUserStore as jest.Mock<ReturnType<typeof useUserStore>>).mockReturnValue(
            {
                ...useUserStoreMock,
                divisionUser: undefined,
            }
        );
        const { container } = render(
            <ProjectPreferences />
        );

        expect(container.firstChild).toBeNull();
    });

    it("should show configured number of recent projects configured by this user", () => {
        (useUserStore as jest.Mock<ReturnType<typeof useUserStore>>).mockReturnValue(
            {
                ...useUserStoreMock,
                divisionUser: useUserStoreMock.divisionUser,
            }
        );

        render(
            <ProjectPreferences />
        );

        expect(screen.getByDisplayValue("5"));

    });
});
