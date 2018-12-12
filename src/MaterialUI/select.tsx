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
}

export class Select extends React.Component<ISelectProps> {
    private readonly mdcSelect: React.RefObject<HTMLDivElement>;

    constructor(props: ISelectProps) {
        super(props);
        this.mdcSelect = React.createRef();
    }

    render() {
        return (
            <div className="mdc-select" ref={this.mdcSelect}>
                <i className="mdc-select__dropdown-icon"></i>
                <select className="mdc-select__native-control" defaultValue={this.props.value} >
                    <option value="" disabled></option>
                    {this.props.children}
                </select>
                <label className="mdc-floating-label">{this.props.label}</label>
                <div className="mdc-line-ripple"></div>
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