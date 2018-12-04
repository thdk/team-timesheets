import * as React from 'react';
import { observer } from 'mobx-react';

@observer
export class List extends React.Component<{ children: JSX.Element }> {
    render() {
        return (
            <ul className="mdc-list" aria-orientation="vertical">
                {this.props.children}
            </ul>
        );
    }
}

@observer
export class ListItem extends React.Component<{ icon?: string; children: JSX.Element }> {
    render() {
        return (
            <li className="mdc-list-item">
                {this.props.icon && <span className="mdc-list-item__graphic material-icons" aria-hidden="true">{this.props.icon}</span>}
                {this.props.children}
            </li>
        );
    }
}