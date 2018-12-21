import * as React from 'react';
import { IReactProps } from '../../types';

export class Box extends React.Component<IReactProps> {
    render() {
        return (
            <div {...this.props} className={`box`}>
                {this.props.children}
            </div>
        )
    }
}
