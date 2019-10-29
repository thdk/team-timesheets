import * as React from 'react';

export interface IFlexGroupProps extends React.HTMLProps<HTMLDivElement> {
    direction?: "vertical" | "horizontal";
    extraCssClass?: string;
    center?: boolean;
}

export const FlexGroup = (props: IFlexGroupProps) => {
    const { direction = "horizontal", extraCssClass = "", style, center = false } = props;

    return (
        <div style={style} className={`flex ${extraCssClass} ${direction}${center ? " center" : ""}`}>
            {props.children}
        </div>
    );
}
