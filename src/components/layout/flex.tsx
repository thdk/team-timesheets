import * as React from 'react';
import { IReactProps } from '../../types';

export interface IFlexGroupProps extends IReactProps {
    direction?: "vertical" | "horizontal";
    extraCssClass?: string;
}

export class FlexGroup extends React.Component<IFlexGroupProps> {
    render() {
        const { direction = "horizontal", extraCssClass = "", style } = this.props;
        return (
            <div style={style} className={`flex ${extraCssClass} ${direction}`}>
                {this.props.children}
            </div>
        )
    }
}
