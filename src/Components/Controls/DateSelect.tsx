import * as React from 'react';
import { FlexGroup } from '../Layout/flex';
import moment from 'moment-es6';
import { Select, SelectOption } from '../../MaterialUI/select';
import { Form, FormField } from '../Layout/form';
import store from '../../stores/RootStore';
import { observer } from 'mobx-react';

export interface IDateSelectProps {
    year?: number;
    month?: number;
}

@observer
export class DateSelect extends React.Component<IDateSelectProps> {
    render() {
        const { year, month} = this.props;
        const months = moment.months().map((m, i) => {
            return <SelectOption key={m} text={m} value={i.toString()}></SelectOption>
        });

        const currentYear = new Date().getFullYear();
        const years = Array.from(Array(5).keys()).map((_, i) => {
            const year = currentYear - i;
            return <SelectOption key={year} text={year.toString()} value={year.toString()}></SelectOption>
        });

        console.log(month);
        console.log(year);
        return (
            <Form>
                <FlexGroup>
                    <FormField>
                        <Select value={year!.toString()} outlined={true} label={"Year"} onChange={this.yearChange}>
                            {years}
                        </Select>
                    </FormField>
                    <FormField first={false}>
                        <Select value={month!.toString()} outlined={true} label={"Month"} onChange={this.monthChange}>
                            {months}
                        </Select>
                    </FormField>
                </FlexGroup>
            </Form>
        );

    }

    monthChange(value: string) {
        store.view.month = +value + 1;
    }

    yearChange(value: string) {
        store.view.year = +value;
    }
}