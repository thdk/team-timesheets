import React from "react";
import { render } from "@testing-library/react";
import { DivisionUserList } from "./division-user-list";
import { useDivisionStore } from "../../../contexts/division-context";

jest.mock("../../../contexts/view-context");
jest.mock("../../../contexts/division-context");
jest.mock("../../../contexts/auth-context");

const useDivisionStoreMock = (useDivisionStore as unknown as jest.Mock<Partial<ReturnType<typeof useDivisionStore>>>);

describe("DivisionUserList", () => {
    it("should display a message when the user is not in any division", () => {
        const {
            getByText,
        } = render(
            <DivisionUserList 
                placeholder="You aren't in any division yet."
            />
        );

        getByText("You aren't in any division yet.");
    });

    it("should display all user's divisions", () => {
        useDivisionStoreMock.mockReturnValue({
            userDivisions: [
                {
                    id: "div-1",
                    divisionUserId: "user-div-1",
                    name: "Division 1",
                    createdBy: "user-div-1",
                },
                {
                    id: "div-2",
                    divisionUserId: "user-div-2",
                    name: "Division 2",
                    createdBy: "user-div-2",
                },
            ],
            collection: {
                isFetched: true,
            } as any,
        });
        const {
            getByText,
        } = render(
            <DivisionUserList />
        );

        getByText("Division 1");
        getByText("Division 2");
    });
});
