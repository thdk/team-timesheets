import * as React from 'react';
import { MDCChipSet } from '@material/chips/index';

export interface IChipProps {
    tabIndex?: number;
    text: string;
    icon?: string;
    isSelected?: boolean;
    onClick: (id: string, selected: boolean) => void;
    id: string;
    type?: "filter" | "choice"
}
export class Chip extends React.Component<IChipProps> {
    private mdcChipRef: React.RefObject<HTMLDivElement>;

    constructor(props: IChipProps) {
        super(props);
        this.mdcChipRef = React.createRef();
    }
    render() {
        // TODO: add tabindex to mdc-chip
        const { tabIndex = 0, text, icon, id, type } = this.props;

        const iconEl = icon ?
            <i className="material-icons mdc-chip__icon mdc-chip__icon--leading">{icon}</i>
            :
            undefined;

        let className = "mdc-chip";
        if (this.props.isSelected) className += " mdc-chip--selected";

        const checkmarkIcon = type === "filter"
            ? <>
                <div className="mdc-chip__checkmark" >
                    <svg className="mdc-chip__checkmark-svg" viewBox="-2 -3 30 30">
                        <path className="mdc-chip__checkmark-path" fill="none" stroke="black"
                            d="M1.73,12.91 8.1,19.28 22.79,4.59" />
                    </svg>
                </div>
            </>
            : undefined;

        return (
            <div tabIndex={tabIndex} className={className} id={id} ref={this.mdcChipRef} key={id}>
                {iconEl}
                {checkmarkIcon}
                <div className="mdc-chip__text">{text}</div>
            </div>
        );
    }

    interaction = (e: Event) => {
        if (this.isChipEvent(e)) {
            this.mdcChipRef.current && this.props.onClick(e.detail.chipId, e.detail.selected);
        };
    }

    isChipEvent = (e: any): e is Event & { detail: { chipId: string, selected: boolean } } => {
        return !!e.detail;
    }

    componentDidMount() {
        this.mdcChipRef.current &&
            this.mdcChipRef.current.addEventListener("MDCChip:selection", (e) => this.interaction(e));
    }

    componentWillUnmount() {
        this.mdcChipRef.current &&
            this.mdcChipRef.current.removeEventListener("MDCChip:selection", this.interaction);
    }
}

export interface IChipSetProps {
    type: "standard" | "filter" | "choice";
}

export class ChipSet extends React.Component<IChipSetProps> {
    private mdcChipSet: React.RefObject<HTMLDivElement>;
    constructor(props: IChipSetProps) {
        super(props);
        this.mdcChipSet = React.createRef();
    }

    render() {
        // TODO: add tabindex to mdc-chip
        let classNames = ["mdc-chip-set"];
        switch (this.props.type) {
            case "choice":
                classNames.push("mdc-chip-set--choice");
                break;
            case "filter":
                classNames.push("mdc-chip-set--filter");
                break;
            default:
                break;
        }
        return (
            <div className={classNames.join(" ")} ref={this.mdcChipSet}>
                {this.props.children}
            </div>
        );
    }

    componentDidMount() {
        MDCChipSet.attachTo(this.mdcChipSet.current);
    }
}