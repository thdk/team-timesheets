import React from 'react';

export const Form = (props: React.HTMLProps<HTMLDivElement>) => {
    const {children, ...rest} = props;
    return (
        <div className="form" {...rest}>
            {children}
        </div>
    );
}

export const FormField = ({
    children,
    first = true,
}: React.PropsWithChildren<{
    first?: boolean;
}>) => {
    return (
        <div
            className={`${first ? "first " : ""}formField`}
        >
            {children}
        </div>
    )
};
