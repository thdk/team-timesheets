import * as React from "react";
import { MDCTextField } from '@material/textfield/index';

export interface ITextFieldProps {
    id?: string;
    hint?: string;
    fullWidth?: boolean;
    leadingIcon?: string;
    outlined?: boolean;
    disabled?: boolean;
    dense?: boolean;
    value?: string;
    onChange?: (value: string) => void;
    tabIndex?: number;
    focus?: true;
    rows?: number;
    cols?: number;
    type?: "text" | "number",
    innerRef?: React.Ref<HTMLInputElement | HTMLTextAreaElement>;
    onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onFocus?: (e: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
    style?: React.CSSProperties;
}

export class TextFieldOld extends React.Component<ITextFieldProps> {
    private readonly mdcTextField: React.RefObject<HTMLDivElement>;

    constructor(props: ITextFieldProps) {
        super(props);
        this.mdcTextField = React.createRef();
    }

    render() {
        const { dense, type = "text", innerRef, rows, cols, tabIndex, id, hint, fullWidth = false, leadingIcon, outlined = false, value = "", disabled = false, onKeyPress, onFocus, onBlur } = this.props;
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
        if (dense) className += " mdc-text-field--dense";

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
            type,
            onKeyUp: onKeyPress, // keypress is not firing for escape key
            onFocus,
            onBlur,
        }

        const isTextAreaRef = (_ref?: React.Ref<HTMLTextAreaElement | HTMLInputElement>): _ref is React.Ref<HTMLTextAreaElement> => {
            return true;
        }

        const isTextInputRef = (_ref?: React.Ref<HTMLTextAreaElement | HTMLInputElement>): _ref is React.Ref<HTMLInputElement> => {
            return true;
        }

        const input = isTextArea && isTextAreaRef(innerRef) ?
            <textarea ref={innerRef} cols={cols} rows={rows} {...attr} />
            :
            isTextInputRef(innerRef)
                ? <input ref={innerRef} {...attr} />
                : <input {...attr} />;

        return (
            <>
                <div style={this.props.style} className={className} ref={this.mdcTextField}>
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


export default React.forwardRef<HTMLInputElement, ITextFieldProps>((props, ref) => (
    <TextFieldOld innerRef={ref} {...props}></TextFieldOld>
))