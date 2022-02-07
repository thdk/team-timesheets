import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { GithubSettings } from ".";
import { useUserStore } from "../../contexts/user-context";
import { useGithubOauth } from "../../oauth-providers";

jest.mock("firebase/functions");

jest.mock("../../contexts/user-context");
jest.mock("../../oauth-providers/use-github-oauth");

describe("GithubSettings", () => {
    describe("when user has successfully authenticated with github", () => {
    
        beforeEach(() => {
            (useGithubOauth as jest.Mock<ReturnType<typeof useGithubOauth>>)
                .mockReturnValue({
                    isLoading: false,
                    oauth: {
                        accessToken: "foobar",
                    },
                    data: {
                        login: "thdk",
                    },
                } as any)
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

            render(<GithubSettings />);
    
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

});
