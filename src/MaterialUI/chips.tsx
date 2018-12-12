import * as React from 'react';
import { MDCChipSet } from '@material/chips/index';

export interface IChipProps {
    tabIndex?: number;
    text: string;
    icon?: string;
    isSelected?: boolean;
    onClick: (id: string) => void;
    id: string;
}
export class Chip extends React.Component<IChipProps> {
    private mdcChipRef: React.RefObject<HTMLDivElement>;

    constructor(props: IChipProps) {
        super(props);
        this.mdcChipRef = React.createRef();
    }
    render() {
        // TODO: add tabindex to mdc-chip
        const { tabIndex = 0, text, icon, id } = this.props;

        const iconEl = icon ?
            <i className="material-icons mdc-chip__icon mdc-chip__icon--leading">{icon}</i>
            :
            undefined;

        let className = "mdc-chip";
        if (this.props.isSelected) className += " mdc-chip--selected";

        return (
            <div tabIndex={tabIndex} className={className} id={id} ref={this.mdcChipRef} key={id}>
                {iconEl}
                <div className="mdc-chip__text">{text}</div>
            </div>
        );
    }

    interaction = (e: Event) => {
        if (this.isChipEvent(e)) {
            this.mdcChipRef.current && this.props.onClick(e.detail.chipId);
        };
    }

    isChipEvent = (e: any): e is Event & { detail: { chipId: string } } => {
        return !!e.detail;
    }

    componentDidMount() {
        this.mdcChipRef.current!.addEventListener("MDCChip:interaction", this.interaction);
    }

    componentWillUnmount() {
        this.mdcChipRef.current &&
            this.mdcChipRef.current.removeEventListener("MDCChip:interaction", this.interaction);
    }
}

export interface IChipSetProps {
    type: "standard" | "filter" | "choice";
}

export class ChipSet extends React.Component<IChipSetProps> {
    private mdcChipSet: React.RefObject<MDCChipSet>;
    constructor(props: IChipSetProps) {
        super(props);
        this.mdcChipSet = React.createRef();
    }

    render() {
        // TODO: add tabindex to mdc-chip
        let className = "mdc-chip-set";
        switch (this.props.type) {
            case "choice":
                className += " mdc-chip-set--choice";
                break;
            default:
                break;
        }
        return (
            <div className={className} ref={this.mdcChipSet}>
                {this.props.children}
            </div>
        );
    }

    componentDidMount() {
        MDCChipSet.attachTo(this.mdcChipSet.current);
    }
}