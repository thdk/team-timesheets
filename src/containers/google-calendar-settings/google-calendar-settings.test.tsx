import { render } from "@testing-library/react";
import React from "react";
import { GoogleCalendarSettings } from ".";

jest.mock("../../hooks/use-gapi");
jest.mock("../configs/use-google-config");

describe("connections", () => {
    it("renders", () => {
        render(<GoogleCalendarSettings />);
    });
});
