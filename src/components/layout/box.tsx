import React from 'react';

export const Box = (props: React.HTMLProps<HTMLDivElement>) => {
    const { className, children, ...rest } = props;
    return (
        <div {...rest} className={`${className} box`}>
            {children}
        </div>
    );
}
