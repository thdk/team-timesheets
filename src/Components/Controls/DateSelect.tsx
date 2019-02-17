import * as React from 'react';
import { FlexGroup } from '../Layout/flex';
import moment from 'moment-es6';
import { Select, SelectOption } from '../../mdc/select';
import { FormField } from '../Layout/form';
import { IReactProps } from '../../types';

export interface IDateSelectProps extends IReactProps {
    year?: number;
    month?: number;
    onMonthChange: (month: number) => void;
    onYearChange: (year: number) => void;
}

export class DateSelect extends React.Component<IDateSelectProps> {
    render() {
        const { year, month, style } = this.props;
        const months = moment.months().map((m, i) => {
            return <SelectOption key={m} text={m} value={i.toString()}></SelectOption>
        });

        const currentYear = new Date().getFullYear();
        const years = Array.from(Array(5).keys()).map((_, i) => {
            const year = currentYear - i;
            return <SelectOption key={year} text={year.toString()} value={year.toString()}></SelectOption>
        });

        return (
            <FlexGroup style={style}>
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