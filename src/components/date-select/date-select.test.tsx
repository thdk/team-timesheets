import React from "react";
import { render } from "@testing-library/react";
import { DateSelect } from "./";

beforeAll(() => {
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date(2020, 3, 1));
});

afterAll(() => {
    jest.useRealTimers();
});

describe("DateSelect", () => {
    it("should render", () => {
        const onMonthChange = jest.fn();
        const onYearChagne = jest.fn();

        const { asFragment } = render(
            <DateSelect
                onMonthChange={onMonthChange}
                onYearChange={onYearChagne}
            />
        );

        expect(asFragment()).toMatchSnapshot();

    });

    it("should render with given year and month selected", () => {
        const yearValue = 2019;
        const monthValue = 3;

        const { container } = render(
            <DateSelect
                onMonthChange={jest.fn()}
                onYearChange={jest.fn()}
                month={monthValue}
                year={yearValue}
            />
        );

        const yearEl = container.querySelector(".date-select-year .mdc-select__selected-text");
        expect(yearEl).not.toBeNull();

        expect(yearEl!.innerHTML).toBe(yearValue.toString());

        const monthEl = container.querySelector(".date-select-month .mdc-select__selected-text");
        expect(monthEl).not.toBeNull();

        expect(monthEl!.innerHTML).toEqual("April");
    });
});