import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Connections } from ".";
import { useUserStore } from "../../../contexts/user-context";

jest.mock("firebase/functions");

jest.mock("../../../hooks/use-gapi");
jest.mock("../../../containers/configs/use-google-config");
jest.mock("../../../contexts/user-context");
jest.mock("../../../oauth-providers/use-github-oauth");

describe("connections", () => {
    it("renders", () => {
        (useUserStore as jest.Mock<ReturnType<typeof useUserStore>>)
            .mockReturnValue({
                divisionUser: {
                    githubRepos: []
                },
                updateDivisionUser: jest.fn(),
            } as any)
        render(<Connections />);
    });

    xit("can save github settings", async () => {
        const updateDivisionUser = jest.fn();
        (useUserStore as jest.Mock<ReturnType<typeof useUserStore>>)
            .mockReturnValue({
                divisionUser: {
                    githubRepos: []
                },
                updateDivisionUser,
            } as any)
        render(<Connections />);

        const repoTextBoxEl = screen.getByText("Github repo");

        userEvent.type(repoTextBoxEl, "thdk/team-timesheets");

        userEvent.click(screen.getByText("Save github settings"));

        expect(updateDivisionUser).toHaveBeenCalledWith(
            expect.objectContaining({
                "githubRepos": ["thdk/team-timesheets"],
            }),
        );
    });
});
