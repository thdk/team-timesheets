import * as React from 'react';
import { IReactProps } from '../../types';

export const Form = (props: IReactProps) => {
    return (
        <div className="form">
            {props.children}
        </div>
    );
}

export interface IFormFieldProps extends IReactProps {
    first?: false;
}

export const FormField = (props: IFormFieldProps) => {
    const {first = true} = props;
    return (
        <div className={`${first ? "first " : ""}formField`}>
            {props.children}
        </div>
    )
};