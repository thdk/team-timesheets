import * as React from 'react';
import { IReactProps } from '../../types';

export interface IFlexGroupProps {
    direction?: "vertical" | "horizontal";
    extraCssClass?: string;
}

export class FlexGroup extends React.Component<IFlexGroupProps> {
    render() {
        const { direction = "horizontal", extraCssClass = "" } = this.props;
        return (
            <div className={`flex ${extraCssClass} ${direction}`}>
                {this.props.children}
            </div>
        )
    }
}
