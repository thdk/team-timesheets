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

export interface ISelectProps extends IReactProps {
    label: string;
    value?: string;
    onChange: (value: string) => void;
    outlined?: boolean;
}

export class Select extends React.Component<ISelectProps> {
    private readonly mdcSelect: React.RefObject<HTMLDivElement>;

    constructor(props: ISelectProps) {
        super(props);
        this.mdcSelect = React.createRef();
    }

    render() {
        const { label, value, outlined } = this.props;
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

        return (
            <div className={classList.join(" ")} ref={this.mdcSelect}>
                <i className="mdc-select__dropdown-icon"></i>
                <select onChange={() =>{}} className="mdc-select__native-control" value={value} >
                    <option value="" disabled></option>
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