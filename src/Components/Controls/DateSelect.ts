import * as React from 'react';
import { FlexGroup } from '../Layout/flex';
import moment from 'moment-es6';
import { Select, SelectOption } from '../../MaterialUI/select';

export interface IDateSelectProps {

}

export class DateSelect extends React.Component<IDateSelectProps> {
    render() {
        const months = moment.months().map(m => {
            return <SelectOption></SelectOption>
        });
    }
}