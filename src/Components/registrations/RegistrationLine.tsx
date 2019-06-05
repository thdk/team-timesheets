import * as React from 'react';
import Checkbox from '@material/react-checkbox';
import store from '../../stores/RootStore';

export interface IRegistrationLineProps extends React.HTMLProps<HTMLDivElement> {
    readonly line1: string;
    readonly line2?: string;
    readonly icon?: string;
    readonly time?: number;
    readonly id: string;
    readonly onSelect: () => void;
}

const registrationLine = (props: IRegistrationLineProps) => {
    const { line1, line2, icon, time = 0, id, onSelect, ...restProps } = props;

    const iconJSX = icon
        ? <span className="icon material-icons" aria-hidden="true">{icon}</span>
        : undefined;

    const line1JSX =
        <span className="line1 mdc-typography--subtitle1">
            {line1}
        </span>;

    const line2JSX = line2 ?
        <span className="line2 mdc-typography--subtitle2">
            {line2}
        </span>
        : undefined;

    return <div className="registration-line" {...restProps}>
        <div className="registration-line-header">
            {iconJSX}
        </div>

        <div className="registration-line-content">
            {line1JSX}
            {line2JSX}
        </div>

        <div className="registration-line-time">
            {parseFloat(time.toFixed(2))}
        </div>

        <div className="registration-line-select">
            <Checkbox onClick={(e: MouseEvent) => {
                e.stopPropagation();
                e.preventDefault();
            }}
                checked={store.view.selection.has(id)}
                onChange={onSelect}
            ></Checkbox>
        </div>
    </div>
}

export default registrationLine;