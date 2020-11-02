import React from "react";
import { DivisionsTabContent } from "./division-tab-content";
import { render } from "@testing-library/react";
import { useViewStore } from "../../contexts/view-context";

jest.mock("../../contexts/view-context");
jest.mock("../../contexts/division-context");

describe("DivisionTabContent", () => {
    it("should add view actions when rendered", () => {
        const setActions = jest.fn();
        const setFabs = jest.fn();
        (useViewStore as unknown as jest.Mock<Partial<ReturnType<typeof useViewStore>>>).mockReturnValue(
            {
                setActions,
                setFabs,
            }
        );
        render(
            <DivisionsTabContent />
        );

        expect(setActions).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    icon: {
                        content: "person_remove",
                        label: "Leave division"
                    },
                }),
            ])
        )
    });
});