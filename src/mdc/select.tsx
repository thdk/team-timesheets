import * as React from 'react';

import { IReactProps } from "../types";
import { MDCSelect } from '@material/select/index';

export interface ISelectOptionProps {
    text: string;
    value: string;
    disabled?: boolean;
}

export const SelectOption = (props: ISelectOptionProps) => {
    const { text, value, disabled = false } = props;
    return (
        <option value={value} disabled={disabled}>{text}</option>
    );
};

export interface ISelectProps<T = string> extends IReactProps {
    label: string;
    value?: T;
    onChange: (value: T) => void;
    outlined?: boolean;
    disabled?: boolean;
}

export class Select<T extends string> extends React.Component<ISelectProps<T>> {
    private readonly mdcSelect: React.RefObject<HTMLDivElement>;

    constructor(props: ISelectProps<T>) {
        super(props);
        this.mdcSelect = React.createRef();
    }

    render() {
        const { label, value, outlined, disabled } = this.props;
        const lineEl = outlined ?
            <>
                <div className="mdc-notched-outline">
                    <div className="mdc-notched-outline__leading"></div>
                    <div className="mdc-notched-outline__notch">
                        <span className="mdc-floating-label">{label}</span>
                    </div>
                    <div className="mdc-notched-outline__trailing"></div>
                </div>
            </>
            :
            <>
                <label className="mdc-floating-label">{label}</label>
                <div className="mdc-line-ripple"></div>
            </>;

        const classList = ["mdc-select"];
        outlined && classList.push("mdc-select--outlined");
        disabled && classList.push("mdc-select--disabled");

        return (
            <div className={classList.join(" ")} ref={this.mdcSelect}>
                <i className="mdc-select__dropdown-icon"></i>
                <select disabled={disabled} onChange={() => { }} className="mdc-select__native-control" value={value || ""} >
                    {this.props.children}
                </select>
                {lineEl}
            </div>
        );
    }

    componentDidMount() {
        const select = new MDCSelect(this.mdcSelect.current);

        select.listen('MDCSelect:change', () => {
            this.props.onChange(select.value);
        });
    }
}