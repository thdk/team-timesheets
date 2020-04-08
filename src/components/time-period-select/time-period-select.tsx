import * as React from 'react';
import { Select } from "@rmwc/select";

export enum TimePeriod {
    ThisWeek = 0,
    ThisMonth,
    LastMonth,
    ThisYear,
    LastYear,
    NextYear
}

const timePeriodLabels: { [timePeriod: number]: string } = {
    0: "This Week",
    1: "This Month",
    2: "Last Month",
    3: "This Year",
    4: "Last Year",
    5: "Next Year"
};

export interface ITimePeriodSelectProps {
    onChange: (timePeriod: TimePeriod) => void;
    periods?: TimePeriod[];
    value: TimePeriod;
}

export class TimePeriodSelect extends React.Component<ITimePeriodSelectProps> {
    render() {
        const {
            periods = [
                TimePeriod.ThisWeek,
                TimePeriod.ThisMonth,
                TimePeriod.LastMonth,
                TimePeriod.ThisYear,
                TimePeriod.LastYear,
                TimePeriod.NextYear,
            ],
            value
        } = this.props;

        const periodSelectOptions = periods.map(p =>
            <option value={p.toString()} key={p}>{timePeriodLabels[p]}</option>
        );

        const selectProps = {
            onChange: this.onChange.bind(this),
            label: "Time period 2"
        };

        return (
            <Select data-testid="time-period-select" value={value.toString()} outlined={true} {...selectProps}>
                {periodSelectOptions}
            </Select>
        );
    }

    onChange(event: React.ChangeEvent<HTMLSelectElement>) {
        const value = event.currentTarget.value;
        const timePeriod = (+value) as TimePeriod;
        this.props.onChange(timePeriod);
    }
}