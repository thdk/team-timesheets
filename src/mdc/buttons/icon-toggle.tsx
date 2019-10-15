import * as React from 'react';
import { MDCIconToggle } from '@material/icon-toggle/index';

import { IReactProps } from '../../types';
import { IIconData } from './icon-buttons';

export interface IIconToggleProps extends IReactProps {
    toggleOn: IIconData;
    toggleOff: IIconData;
    onChange: (isOn: boolean) => void;
    isActive: boolean;
}

export class IconToggle extends React.Component<IIconToggleProps> {
    private iconToggleRef: React.RefObject<HTMLElement>;

    constructor(props: IIconToggleProps) {
        super(props);
        this.iconToggleRef = React.createRef();
    }
    render() {
        const { toggleOn, toggleOff, isActive } = this.props;

        return (
            <i ref={this.iconToggleRef} className="mdc-icon-toggle material-icons" role="button" aria-pressed="false"
                aria-label={isActive ? toggleOn.label : toggleOff.label}
                data-toggle-on={JSON.stringify(toggleOn)}
                data-toggle-off={JSON.stringify(toggleOff)}>
                {isActive ? toggleOn.content : toggleOff.content}
            </i>
        );
    }

    componentDidMount() {
        const iconEl = this.iconToggleRef.current;
        if (iconEl) {
            MDCIconToggle.attachTo(iconEl);

            iconEl.addEventListener('MDCIconToggle:change', data => {
                this.props.onChange(data.detail.isOn);
            });
        }

    }
}