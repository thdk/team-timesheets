import { render } from "@testing-library/react";
import React from "react";
import { Connections } from ".";
import { useUserStore } from "../../../contexts/user-context";

jest.mock("firebase/functions");

jest.mock("../../../hooks/use-gapi");
jest.mock("../../../containers/configs/use-google-config");
jest.mock("../../../contexts/user-context");
jest.mock("../../../oauth-providers/use-github-oauth");
jest.mock("../../../containers/github-settings");

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
});
