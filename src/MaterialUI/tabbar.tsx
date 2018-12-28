import * as React from 'react';
import { IReactProps } from '../types';
import { MDCTabBar } from '@material/tab-bar/index';

export interface ITabBarProps extends IReactProps {
    children: React.ReactNode;
}

export class TapBar extends React.Component<ITabBarProps> {
    private tabBarRef: React.RefObject<HTMLDivElement>;
    constructor(props: ITabBarProps) {
        super(props);
        this.tabBarRef = React.createRef();
    }
    render() {
        return (
            <div ref={this.tabBarRef} className="mdc-tab-bar" role="tablist">
                <div className="mdc-tab-scroller">
                    <div className="mdc-tab-scroller__scroll-area">
                        <div className="mdc-tab-scroller__scroll-content">
                            {this.props.children}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    componentDidMount() {
        this.tabBarRef.current && MDCTabBar.attachTo(this.tabBarRef.current);
    }
}


export interface ITabProps extends IReactProps {
    isActive?: boolean;
    icon?: React.ReactNode;
    text?: string;
    onClick: () => void;
}

export class Tab extends React.Component<ITabProps> {
    render() {
        const { isActive = false, icon, text, onClick } = this.props;
        const classNames = ["mdc-tab"];
        isActive && classNames.push("mdc-tab--active");
        const textEl = text ? <span className="mdc-tab__text-label">{text}</span> : undefined;
        return (
            <button onClick={onClick} className={classNames.join(" ")} role="tab" aria-selected={isActive}>
                <span className="mdc-tab__content">
                    {icon}
                    {textEl}
                </span>
                <TabIndicator isActive={isActive}></TabIndicator>
            </button>
        );
    }
}

export const TabIndicator = (props: { isActive?: boolean }) => {
    const { isActive } = props;
    const classNames = ["mdc-tab-indicator"];
    isActive && classNames.push("mdc-tab-indicator--active");

    return (
        <>
            <span className={classNames.join(" ")}>
                <span className="mdc-tab-indicator__content mdc-tab-indicator__content--underline"></span>
            </span>
            <span className="mdc-tab__ripple"></span>
        </>
    );
}