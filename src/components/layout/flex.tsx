import classNames from 'classnames';
import React from 'react';

export interface IFlexGroupProps extends React.HTMLProps<HTMLDivElement> {
    center?: boolean;
    column?: boolean;
}

export const FlexGroup = (props: IFlexGroupProps) => {
    const { column, className, style, center = false } = props;

    const cssClass = classNames([
        "flex",
        className,
        {
            horizontal: !column,
            vertical: column,
            center: center,
        }
    ]);

    return (
        <div style={style} className={cssClass}>
            {props.children}
        </div>
    );
}
