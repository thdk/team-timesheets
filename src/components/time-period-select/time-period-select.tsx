import * as React from 'react';
import { Select } from "@rmwc/select";

export enum TimePeriod {
    ThisWeek = 0,
    ThisMonth,
    LastMonth,
    ThisYear,
    LastYear,
}

const timePeriodLabels: { [timePeriod: number]: string } = {
    0: "This Week",
    1: "This Month",
    2: "Last Month",
    3: "This Year",
    4: "Last Year",
};

export interface ITimePeriodSelectProps {
    onChange: (timePeriod: TimePeriod) => void;
    periods?: TimePeriod[];
    value: TimePeriod;
}

export const TimePeriodSelect = (props: ITimePeriodSelectProps) => {
    const {
        periods = [
            TimePeriod.ThisWeek,
            TimePeriod.ThisMonth,
            TimePeriod.LastMonth,
            TimePeriod.ThisYear,
            TimePeriod.LastYear,
        ],
        value
    } = props;

    const periodSelectOptions = periods.map(p =>
        <option value={p.toString()} key={p}>{timePeriodLabels[p]}</option>
    );

    const onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.currentTarget.value;
        const timePeriod = (+value) as TimePeriod;
        props.onChange(timePeriod);
    }

    return (
        <Select
            id="time-period-select"
            value={value.toString()}
            outlined={true}
            onChange={onChange}
            label={"Time period"}
        >
            {periodSelectOptions}
        </Select>
    );
};
