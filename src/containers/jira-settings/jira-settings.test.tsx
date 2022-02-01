import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { JiraSettings } from ".";
import { useUserStore } from "../../contexts/user-context";

jest.mock("../../contexts/user-context");

describe("connections", () => {
    it("renders", () => {
        (useUserStore as jest.Mock<ReturnType<typeof useUserStore>>)
            .mockReturnValue({
                divisionUser: {
                }
            } as any);

        render(<JiraSettings />);
    });

    it("can save jira settings", async () => {
        const updateDivisionUser = jest.fn();
        (useUserStore as jest.Mock<ReturnType<typeof useUserStore>>)
            .mockReturnValue({
                divisionUser: {
                },
                updateDivisionUser,
            } as any)

        render(<JiraSettings />);

        const userNameTextBoxEl = screen.getByText("Jira username");
        const tokenTextBoxEl = screen.getByText("Jira password");

        userEvent.type(userNameTextBoxEl, "Thomas");
        userEvent.type(tokenTextBoxEl, "secret-password");

        userEvent.click(screen.getByText("Save Jira settings"));

        expect(updateDivisionUser).toHaveBeenCalledWith(
            expect.objectContaining({ "jiraPassword": "secret-password", "jiraUsername": "Thomas" }),
        );
    });
});
