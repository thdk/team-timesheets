import { Select } from "@rmwc/select";
import moment from 'moment';
import React from 'react';

import { FlexGroup } from '../layout/flex';
import { FormField } from '../layout/form';

export interface IDateSelectProps extends React.HTMLProps<HTMLDivElement> {
    year: number | null;
    month: number | null;
    onMonthChange: (month: number) => void;
    onYearChange: (year: number) => void;
}

export const DateSelect = ({
    onMonthChange,
    onYearChange,
    year,
    month,
    ...rest
}: IDateSelectProps) => {
    const handleOnMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.currentTarget.value;
        onMonthChange(+value);
    };

    const handleOnYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.currentTarget.value;
        onYearChange(+value);
    };

    const monthOptions = moment.months().map((m, i) => ({
        label: m.toString(),
        value: i.toString(),
    }));

    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from(Array(5).keys()).map((_, i) => {
        const year = currentYear - i;
        return {
            label: year.toString(),
            value: year.toString(),
        };
    });

    return (
        <FlexGroup {...rest}>
            <FormField>
                <Select
                    className={"date-select-year"}
                    options={yearOptions}
                    value={year ? year.toString() : undefined}
                    outlined={true}
                    label={"Year"}
                    onChange={handleOnYearChange}
                />
            </FormField>
            <FormField first={false}>
                <Select
                    className={"date-select-month"}
                    value={month ? month.toString() : undefined}
                    outlined={true}
                    label={"Month"}
                    onChange={handleOnMonthChange}
                    options={monthOptions}
                />
            </FormField>
        </FlexGroup>
    );
};
