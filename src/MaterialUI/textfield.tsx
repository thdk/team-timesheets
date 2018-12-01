import * as React from "react";
import { MDCTextField } from '@material/textfield';

export interface ITextFieldProps {
    id: string;
    hint: string;
    fullWidth?: boolean;
    leadingIcon?: string;
    outlined?: boolean;
    value?: string;
}

export class TextField extends React.Component<ITextFieldProps> {
    private readonly mdcTextField: React.RefObject<HTMLDivElement>;
    constructor(props: ITextFieldProps) {
        super(props);
        // create a ref to store the textInput DOM element
        this.mdcTextField = React.createRef();
    }

    render() {
        const { id, hint, fullWidth = false, leadingIcon, outlined = false, value = "" } = this.props;
        const leadingIconEl = leadingIcon ?
            <i className="material-icons mdc-text-field__icon">{leadingIcon}</i>
            :
            "";

        let className = "mdc-text-field";
        if (fullWidth) className += " mdc-text-field--fullwidth";
        if (leadingIcon) className += " mdc-text-field--with-leading-icon";
        if (outlined) className += " text-field mdc-text-field--outlined";

        const lineEl = outlined ?
            <>
                <div className="mdc-notched-outline">
                    <svg>
                        <path className="mdc-notched-outline__path" />
                    </svg>
                </div>
                <div className="mdc-notched-outline__idle"></div>
            </>
            :
            <div className="mdc-line-ripple"></div>;

        const input = fullWidth ?
            <input type="text" id={id} placeholder={hint} className="mdc-text-field__input" />
            :
            <>
                <input type="text" id={id} className="mdc-text-field__input" defaultValue={value} />
                <label className="mdc-floating-label" htmlFor={id}>{hint}</label>
            </>;
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

        // hack because of the outline not being rendered on the right side
        if (this.props.outlined && this.mdcTextField.current)
        {

            this.mdcTextField.current.focus();
        }
        MDCTextField.attachTo(this.mdcTextField.current);
    }
}