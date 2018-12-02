import * as React from 'react';
import { MDCChipSet } from '@material/chips';

export interface IChipProps {
    tabIndex: number;
    text: string;
    color?: string;
    icon?: string;
    isSelected?: boolean;
    onClick: (id: string) => void;
    id?: string;
}
export class Chip extends React.Component<IChipProps> {
    private mdcChipRef: React.RefObject<HTMLDivElement>;

    constructor(props: IChipProps) {
        super(props);
        this.mdcChipRef = React.createRef();
    }
    render() {
        // TODO: add tabindex to mdc-chip
        const { color = "grey", tabIndex, text, icon, id } = this.props;

        const iconEl = icon ?
            <i className="material-icons mdc-chip__icon mdc-chip__icon--leading">{icon}</i>
            :
            undefined;

        let className = "mdc-chip";
        if (this.props.isSelected) className += " mdc-chip--selected";
        return (
            <div tabIndex={tabIndex} className={className} id={id} ref={this.mdcChipRef} key={tabIndex}>
                {iconEl}
                <div className="mdc-chip__text">{text}</div>
            </div>
        );
    }

    componentDidMount() {
        console.log(this.mdcChipRef.current);
        this.mdcChipRef.current &&
            this.mdcChipRef.current.addEventListener("click", this.click);
            // this.mdcChipRef.current &&
            // this.mdcChipRef.current.addEventListener("MDCChip:interaction", this.interaction);

    }

    click = () => {
        this.mdcChipRef.current && this.props.onClick(this.mdcChipRef.current.id);
    }

    // interaction = (e: Event) => {
    //    console.log(e);
    //    alert("interaction");
    // }

    componentWillUnmount() {
        this.mdcChipRef.current &&
            this.mdcChipRef.current.removeEventListener("click", this.click);
        // this.mdcChipRef.current &&
        //     this.mdcChipRef.current.removeEventListener("MDCChip:interaction", this.interaction);
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