import * as React from 'react';
import { IReactProps } from '../types';

export interface IListProps extends IReactProps {
    isTwoLine?: boolean;
    isDense?: boolean;
}

export class List extends React.Component<IListProps> {
    render() {
        const { isTwoLine, style, isDense } = this.props;

        const classNames = ["mdc-list"];
        isTwoLine && classNames.push("mdc-list--two-line");
        isDense && classNames.push("mdc-list--dense");
        return (
            <ul style={style} className={classNames.join(" ")} aria-orientation="vertical">
                {this.props.children}
            </ul>
        );
    }
}

export interface IListItemProps extends IReactProps {
    lines?: { length: 1 | 2 } & [React.ReactNode, ...React.ReactNode[]];
    icon?: string;
    meta?: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
}

export class ListItem extends React.Component<IListItemProps> {
    private readonly liRef: React.RefObject<HTMLLIElement>;
    constructor(props: IListItemProps) {
        super(props);
        this.liRef = React.createRef();
    }
    render() {
        const { lines = [undefined], icon, meta, disabled = false } = this.props;

        const line1El = lines.length === 2
            ? <span className="mdc-list-item__primary-text">{lines[0]}</span>
            : lines[0]
        const line2El = lines.length === 2
            ? <span className="mdc-list-item__secondary-text">{lines[1]}</span>
            : undefined;

        const classNames = ["mdc-list-item"];
        if (disabled) classNames.push("mdc-list-item--disabled");

        return (
            <li ref={this.liRef} className={classNames.join(" ")}>
                {icon !== undefined && <span className="mdc-list-item__graphic material-icons" aria-hidden="true">{icon}</span>}
                <span className="mdc-list-item__text">
                    {line1El}
                    {line2El}
                </span>
                {meta && <span className="mdc-list-item__meta">{meta}</span>}
            </li>
        );
    }



    componentDidMount() {
        this.props.onClick && this.liRef.current && this.liRef.current.addEventListener("click", e => {
            const targetEl = e.target as HTMLElement
            if (targetEl && targetEl.closest(".clickable")) {
                return;
            };
            this.props.onClick && this.props.onClick()
        });
    }

    componentWillUnmount() {
        this.props.onClick && this.liRef.current && this.liRef.current.removeEventListener("click", this.props.onClick)
    }
}

export enum ListDividerType {
    standard,
    padded,
    inset
}

export interface IListDividerProps {
    type?: ListDividerType;
}

export class ListDivider extends React.Component<IListDividerProps> {
    render() {
        const { type = ListDividerType.standard } = this.props;
        const classNames = ["mdc-list-divider"];
        if (type === ListDividerType.padded) classNames.push("mdc-list-divider--padded");
        if (type === ListDividerType.inset) classNames.push("mdc-list-divider--inset");
        return (
            <hr className={classNames.join(" ")}></hr>
        );
    }
}