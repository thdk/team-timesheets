import * as React from "react";

import { TimePeriodSelect, TimePeriod } from "./time-period-select";
import { render } from "@testing-library/react";

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