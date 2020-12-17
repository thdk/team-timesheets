import React from "react";
import { render, act, fireEvent } from "@testing-library/react";
import { DivisionDetail } from "./division-detail";

describe("DivisionDetail", () => {
    it("should render without data", () => {
        const {
            asFragment,
        } = render(
            <DivisionDetail
                onIconChanged={jest.fn()}
                onNameChanged={jest.fn()}
            />
        );

        expect(asFragment()).toMatchSnapshot();
    });

    it("should call onNameChanged", () => {
        const onNameChanged = jest.fn();
        const {
            container,
        } = render(
            <DivisionDetail
                onIconChanged={jest.fn()}
                onNameChanged={onNameChanged}
            />
        );

        act(() => {
            fireEvent.change(container.querySelector("input")!, {
                target: {
                    value: "Foo",
                },
            });
        });

        expect(onNameChanged).toHaveBeenCalledWith("Foo");
    });
})