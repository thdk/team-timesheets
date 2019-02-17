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
    rows?: number;
    cols?: number;
    type?: "text" | "number"
}

export class TextField extends React.Component<ITextFieldProps> {
    private readonly mdcTextField: React.RefObject<HTMLDivElement>;

    constructor(props: ITextFieldProps) {
        super(props);
        this.mdcTextField = React.createRef();
    }

    render() {
        const { type = "text", rows, cols, tabIndex, id, hint, fullWidth = false, leadingIcon, outlined = false, value = "", disabled = false } = this.props;
        const isTextArea = !!rows && !!cols;
        const leadingIconEl = leadingIcon ?
            <i className="material-icons mdc-text-field__icon">{leadingIcon}</i>
            :
            "";

        let className = "mdc-text-field";
        if (isTextArea) className += " mdc-text-field--textarea";
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

        const attr = {
            tabIndex,
            placeholder: fullWidth ? hint : undefined,
            id,
            className: "mdc-text-field__input",
            value,
            onChange: this.onChange,
            type
        }


        const input = isTextArea ?
            <textarea cols={cols} rows={rows} {...attr} />
            :
            <input {...attr} />

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
        const textField = new MDCTextField(this.mdcTextField.current);
        this.props.focus && textField.focus();
    }

    onChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        this.props.onChange && this.props.onChange(event.target.value);
    }
}