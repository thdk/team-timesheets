import * as React from 'react';
import { MDCCheckbox } from '@material/checkbox/index';

export interface ICheckboxProps {
    checked?: boolean;
    disabled?: boolean;
    onClick: (e: React.MouseEvent) => void;
}

export class Checkbox extends React.Component<ICheckboxProps> {
    private mdcRef: React.RefObject<HTMLDivElement>;
    private mdcCheckbox: any;

    constructor(props: ICheckboxProps) {
        super(props);
        this.mdcRef = React.createRef();
    }

    render() {
        return (
            <>
                <div ref={this.mdcRef} className="mdc-checkbox">
                    <input {...this.props}
                        type="checkbox"
                        className="mdc-checkbox__native-control"
                        id="checkbox-1" />
                    <div className="mdc-checkbox__background">
                        <svg className="mdc-checkbox__checkmark"
                            viewBox="0 0 24 24">
                            <path className="mdc-checkbox__checkmark-path"
                                fill="none"
                                d="M1.73,12.91 8.1,19.28 22.79,4.59" />
                        </svg>
                        <div className="mdc-checkbox__mixedmark"></div>
                    </div>
                </div>
            </>
        );
    }

    componentDidMount() {
        if (this.mdcRef.current) {
            this.mdcCheckbox = new MDCCheckbox(this.mdcRef.current);
            this.mdcCheckbox.handleChange = () => {
                console.log(this.mdcCheckbox.checked);
            }
        }
    }

    componentWillUnmount() {
        this.mdcCheckbox.destroy();
    }
}