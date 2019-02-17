import * as React from 'react';
import { Select, SelectOption, ISelectProps } from '../../mdc/select';

export enum TimePeriod {
    ThisWeek = 0,
    ThisMonth,
    LastMonth,
    ThisYear,
    LastYear
}

const timePeriodLabels: { [timePeriod: number]: string } = {
    0: "This Week",
    1: "This Month",
    2: "Last Month",
    3: "This Year",
    4: "Last Year"
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
                TimePeriod.LastYear
            ],
            value
        } = this.props;

        const periodSelectOptions = periods.map(p =>
            <SelectOption value={p.toString()} key={p} text={timePeriodLabels[p]}></SelectOption>
        );

        const selectProps: ISelectProps<string> = {
            onChange: this.onChange.bind(this),
            label: "Time period"
        };

        return (
            <Select value={value.toString()} outlined={true} {...selectProps}>
                {periodSelectOptions}
            </Select>
        );
    }

    onChange(value: string) {
        const timePeriod = (+value) as TimePeriod;
        this.props.onChange(timePeriod);
    }
}