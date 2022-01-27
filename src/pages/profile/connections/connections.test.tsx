import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Connections } from ".";
import { useUserStore } from "../../../contexts/user-context";

jest.mock("../../../hooks/use-gapi");
jest.mock("../../../containers/configs/use-google-config");
jest.mock("../../../contexts/user-context");

describe("connections", () => {
    it("renders", () => {
        (useUserStore as jest.Mock<ReturnType<typeof useUserStore>>)
            .mockReturnValue({
                divisionUser: {
                    githubRepos: []
                }
            } as any)
        render(<Connections />);
    });

    it("can save github settings", async () => {
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
        const userNameTextBoxEl = screen.getByText("Github username");
        const tokenTextBoxEl = screen.getByText("Github personal access token");

        userEvent.type(repoTextBoxEl, "thdk/team-timesheets");
        userEvent.type(userNameTextBoxEl, "thdk");
        userEvent.type(tokenTextBoxEl, "secret-token");

        userEvent.click(screen.getByText("Save github settings"));

        expect(updateDivisionUser).toHaveBeenCalledWith(
            expect.objectContaining({
                "githubRepos": ["thdk/team-timesheets"],
                "githubToken": "secret-token",
                "githubUsername": "thdk"
            }),
        );
    });
});
