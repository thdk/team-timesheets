import * as React from 'react';
import { IReactProps } from '../../types';

export interface IFlexGroupProps extends IReactProps {
    direction?: "vertical" | "horizontal";
    extraCssClass?: string;
    center?: boolean;
}

export class FlexGroup extends React.Component<IFlexGroupProps> {
    render() {
        const { direction = "horizontal", extraCssClass = "", style, center = false } = this.props;
        return (
            <div style={style} className={`flex ${extraCssClass} ${direction}${center ? " center" : ""}`}>
                {this.props.children}
            </div>
        )
    }
}
