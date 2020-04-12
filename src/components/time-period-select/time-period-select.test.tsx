import * as React from "react";

import { TimePeriodSelect, TimePeriod } from "./";
import { render, fireEvent } from "@testing-library/react";

it("renders", () => {
    const onChange = jest.fn();

    const { asFragment } = render(
        <TimePeriodSelect
            value={TimePeriod.LastMonth}
            onChange={onChange}
        />
    );
    expect(asFragment()).toMatchSnapshot();
});

it("should call onChange when item is selected", (done) => {
    const onChange = jest.fn();

    const { container } = render(
        <TimePeriodSelect
        value={TimePeriod.LastMonth}
        onChange={onChange}
    />
    );
    const selectEl = container.querySelector<HTMLSelectElement>("select");

    window.requestAnimationFrame(() => {
        fireEvent.change(selectEl!);
        expect(onChange).toHaveBeenCalledTimes(1);
        done();
    });
});