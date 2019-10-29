import * as React from 'react';

export const Box = (props: React.HTMLProps<HTMLDivElement>) => {
    const { children, ...rest } = props;
    return (
        <div {...rest} className={`box`}>
            {children}
        </div>
    );
}
