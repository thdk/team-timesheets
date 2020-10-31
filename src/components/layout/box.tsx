import React from 'react';
import classNames from 'classnames';

export const Box = (props: React.HTMLProps<HTMLDivElement>) => {
    const { className, children, ...rest } = props;
    const cssClass = classNames([
        "box",
        className
    ]);
    return (
        <div {...rest} className={cssClass}>
            {children}
        </div>
    );
}
