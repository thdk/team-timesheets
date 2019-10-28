import * as React from 'react';

import { MDCIconButtonToggle } from '@material/icon-button/index';
import { IReactProps } from '../../types';

export interface IIconData {
    label: string;
    content: string;
    cssClass?: string;
}

export interface IIconButtonToggleProps extends IReactProps {
    label: string;
    icon: IIconData;
    iconActive: IIconData;
    isActive: boolean;
    onClick: () => void;
}

export class IconButtonToggle extends React.Component<IIconButtonToggleProps> {
    private iconButtonRef: React.RefObject<HTMLButtonElement>;

    constructor(props: IIconButtonToggleProps) {
        super(props);
        this.iconButtonRef = React.createRef();
    }

    render() {
        const { label, icon, iconActive, onClick, isActive } = this.props;

        const classNames = ["mdc-icon-button"];
        if (isActive) classNames.push("mdc-icon-button--on");

        return (
            <button ref={this.iconButtonRef} onClick={onClick}
                className={classNames.join(" ")}
                aria-label={label}
                aria-hidden="true"
                aria-pressed="false">
                <i className="material-icons mdc-icon-button__icon mdc-icon-button__icon--on">{iconActive.content}</i>
                <i className="material-icons mdc-icon-button__icon">{icon.content}</i>
            </button>
        );
    }

    componentDidMount() {
        const buttonEl = this.iconButtonRef.current;
        if (buttonEl) {
            MDCIconButtonToggle.attachTo(buttonEl);
        }
    }
}