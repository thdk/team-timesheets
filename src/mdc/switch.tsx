import * as React from 'react';
import { MDCSwitch } from '@material/switch/index';

export interface ISwitchProps extends React.HTMLProps<HTMLDivElement> {
    readonly label: string;
    readonly checked: boolean;
    readonly disabled?: boolean;
    readonly onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default class Switch extends React.Component<ISwitchProps> {
    private mdcSwitchRef: React.RefObject<HTMLDivElement>;
    private mdcSwitch: any;

    constructor(props: ISwitchProps) {
        super(props);
        this.mdcSwitchRef = React.createRef();
    }

    render() {
        const { label, checked, disabled, style } = this.props;

        const classNames = [
            "mdc-switch",
            ...(checked ? ["mdc-switch--checked"] : []),
            ...(disabled ? ["mdc-switch--disabled"] : [])
        ];

        return (
            <>
                <div style={style} ref={this.mdcSwitchRef} className={classNames.join(" ")}>
                    <div className="mdc-switch__track"></div>
                    <div className="mdc-switch__thumb-underlay">
                        <div className="mdc-switch__thumb">
                            <input onChange={this.onChange.bind(this)} checked={checked} disabled={disabled} type="checkbox" id="basic-switch" className="mdc-switch__native-control" role="switch"></input>
                        </div>
                    </div>
                </div>
                <label htmlFor="basic-switch">{label}</label>
            </>
        );
    }

    componentDidMount() {
        if (this.mdcSwitchRef.current)
            this.mdcSwitch = new MDCSwitch(this.mdcSwitchRef.current);
    }

    componentWillUnmount() {
        this.mdcSwitch && this.mdcSwitch.destroy();
    }

    onChange(e: React.ChangeEvent<HTMLInputElement>) {
        this.props.onChange(e);
    }
}