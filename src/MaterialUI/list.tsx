import * as React from 'react';
import { observer } from 'mobx-react';
import { IReactProps } from '../types';

export interface IListProps extends IReactProps {
    isTwoLine?: boolean;
}

@observer
export class List extends React.Component<IListProps> {
    render() {
        const classNames = ["mdc-list"];
        this.props.isTwoLine && classNames.push("mdc-list--two-line");
        return (
            <ul className={classNames.join(" ")} aria-orientation="vertical">
                {this.props.children}
            </ul>
        );
    }
}

export interface IListItemProps extends IReactProps {
    lines: { length: 1 | 2 } & [string, ...string[]];
    icon?: string;
}

@observer
export class ListItem extends React.Component<IListItemProps> {
    public readonly isTwoLines: boolean;
    constructor(props: IListItemProps) {
        super(props);
        this.isTwoLines = this.props.lines.length > 1;
    }
    render() {
        const { lines } = this.props;
        const line1El = lines.length === 2
            ? <span className="mdc-list-item__primary-text">{lines[0]}</span>
            : lines[0]
        const line2El = lines.length === 2
            ? <span className="mdc-list-item__secondary-text">{lines[1]}</span>
            : undefined;
        return (
            <li className="mdc-list-item">
                {this.props.icon && <span className="mdc-list-item__graphic material-icons" aria-hidden="true">{this.props.icon}</span>}
                <span className="mdc-list-item__text">
                    {line1El}
                    {line2El}
                </span>
            </li>
        );
    }
}