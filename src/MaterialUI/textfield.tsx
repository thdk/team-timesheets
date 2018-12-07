import * as React from "react";
import { MDCTextField } from '@material/textfield/index';

export interface ITextFieldProps {
    id: string;
    hint: string;
    fullWidth?: boolean;
    leadingIcon?: string;
    outlined?: boolean;
    disabled?: boolean;
    value?: string;
    onChange?: (value: string) => void;
    tabIndex?: number;
    focus?: true;
}

export class TextField extends React.Component<ITextFieldProps> {
    private readonly mdcTextField: React.RefObject<HTMLDivElement>;
    private readonly inputField: React.RefObject<HTMLInputElement>;

    constructor(props: ITextFieldProps) {
        super(props);
        this.mdcTextField = React.createRef();
        this.inputField = React.createRef();
    }

    render() {
        const { id, hint, fullWidth = false, leadingIcon, outlined = false, value = "", disabled = false } = this.props;
        const leadingIconEl = leadingIcon ?
            <i className="material-icons mdc-text-field__icon">{leadingIcon}</i>
            :
            "";

        let className = "mdc-text-field";
        if (fullWidth) className += " mdc-text-field--fullwidth";
        if (leadingIcon) className += " mdc-text-field--with-leading-icon";
        if (outlined) className += " text-field mdc-text-field--outlined";
        if (disabled) className += " mdc-text-field--disabled";

        const lineEl = outlined !== fullWidth ?
            <>
                <div className="mdc-notched-outline">
                    <div className="mdc-notched-outline__leading"></div>
                    <div className="mdc-notched-outline__notch">
                        <label htmlFor={id} className="mdc-floating-label">{hint}</label>
                    </div>
                    <div className="mdc-notched-outline__trailing"></div>
                </div>
            </>
            :
            <>
                <label className="mdc-floating-label" htmlFor={id}>{hint}</label>
                <div className="mdc-line-ripple"></div>
            </>

        const input = fullWidth ?
            <input ref={this.inputField} type="text" placeholder={hint} id={id} className="mdc-text-field__input" onChange={this.onChange} value={value} />
            :
            <input ref={this.inputField} type="text" id={id} className="mdc-text-field__input" onChange={this.onChange} value={value} />

        return (
            <>
                <div className={className} ref={this.mdcTextField}>
                    {leadingIconEl}
                    {input}
                    {lineEl}
                </div>
            </>
        );
    }

    componentDidMount() {
        MDCTextField.attachTo(this.mdcTextField.current);
        if (this.inputField.current && this.props.focus) {
            this.inputField.current.focus();
        }
    }

    onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.props.onChange && this.props.onChange(event.target.value);
    }
}