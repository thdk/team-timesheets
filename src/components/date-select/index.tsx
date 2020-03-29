import * as React from 'react';
import { FlexGroup } from '../layout/flex';
import moment from 'moment-es6';
import { Select } from  "@rmwc/select";
import { FormField } from '../layout/form';

export interface IDateSelectProps extends React.HTMLProps<HTMLDivElement> {
    year?: number;
    month?: number;
    onMonthChange: (month: number) => void;
    onYearChange: (year: number) => void;
}

export class DateSelect extends React.Component<IDateSelectProps> {
    render() {
        const { year, month, ...rest } = this.props;
        const months = moment.months().map((m, i) => {
            return <option key={m} value={i.toString()}>{m}</option>
        });

        const currentYear = new Date().getFullYear();
        const years = Array.from(Array(5).keys()).map((_, i) => {
            const year = currentYear - i;
            <option key={year} value={year.toString()}>{year.toString()}</option>
        });

        return (
            <FlexGroup {...rest}>
                <FormField>
                    <Select value={year ? year.toString() : undefined} outlined={true} label={"Year"} onChange={this.onYearChange}>
                        {years}
                    </Select>
                </FormField>
                <FormField first={false}>
                    <Select value={month ? month.toString() : undefined} outlined={true} label={"Month"} onChange={this.onMonthChange}>
                        {months}
                    </Select>
                </FormField>
            </FlexGroup>
        );
    }

    onMonthChange = (value: string) => {
        this.props.onMonthChange(+value);
    }

    onYearChange = (value: string) => {
        this.props.onYearChange(+value);
    }
}