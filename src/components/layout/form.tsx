import * as React from 'react';

export const Form = (props: React.HTMLProps<HTMLDivElement>) => {
    const {children, ...rest} = props;
    return (
        <div className="form" {...rest}>
            {props.children}
        </div>
    );
}

export interface IFormFieldProps extends React.HTMLProps<HTMLDivElement> {
    first?: boolean;
}

export const FormField = (props: IFormFieldProps) => {
    const { first = true, ...rest } = props;
    return (
        <div
            className={`${first ? "first " : ""}formField`}
            {...rest}
        >
            {props.children}
        </div>
    )
};
