import * as React from 'react';

export interface IIconProps {
    icon: string;
}

export class Icon extends React.Component<IIconProps> {
    render() {
        return (
            <span className="mdc-tab__icon material-icons" aria-hidden="true">{this.props.icon}</span>
        );
    }
}