import * as React from 'react';
import { IReactProps } from '../types';
import { MDCRipple } from '@material/ripple';

export class Fab extends React.Component<{ icon: string, name: string, onClick: (e: React.MouseEvent) => void }> {
    render() {
        return (
            <button onClick={this.props.onClick} className="mdc-fab app-fab--absolute" aria-label={this.props.name}>
                <span className="mdc-fab__icon material-icons">{this.props.icon}</span>
            </button>
        );
    }
}

export enum ButtonType {
    Text,
    Raised,
    Unelevated,
    Outlined
}

export interface IButtonProps extends IReactProps {
    type?: ButtonType;
    onClick: () => void;
}

export class Button extends React.Component<IButtonProps> {
    private buttonRef: React.RefObject<HTMLButtonElement>;
    constructor(props: IButtonProps) {
        super(props);
        this.buttonRef = React.createRef();
    }
    render() {
        const { type = ButtonType.Text, style, onClick } = this.props;

        const classNames = ["mdc-button"];
        type === ButtonType.Outlined && classNames.push("mdc-button--outlined");
        type === ButtonType.Raised && classNames.push("mdc-button--raised ");
        type === ButtonType.Unelevated && classNames.push("mdc-button--unelevated ");
        return (
            <button onClick={onClick} style={style} ref={this.buttonRef} className={classNames.join(" ")}>
                <span className="mdc-button__label">
                    {this.props.children}
                </span>
            </button>
        );
    }

    componentDidMount() {
        MDCRipple.attachTo(this.buttonRef.current);
    }
}