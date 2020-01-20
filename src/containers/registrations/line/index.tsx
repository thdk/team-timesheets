import * as React from 'react';
import { Checkbox } from '@rmwc/checkbox';
import store from '../../../stores/root-store';
import { observer } from 'mobx-react';
import EditableTextField from '../../../components/editable-text';
import classNames from 'classnames';

export interface IRegistrationLineProps extends React.HTMLProps<HTMLDivElement> {
    readonly line1: string;
    readonly line2?: string;
    readonly icon?: string;
    readonly time?: number;
    readonly id: string;
    readonly onSelect?: () => void;
}

@observer
export default class RegistrationLine extends React.Component<IRegistrationLineProps> {
    private timeInputEl: React.RefObject<HTMLInputElement>;
    constructor(props: IRegistrationLineProps) {
        super(props);

        this.timeInputEl = React.createRef<HTMLInputElement>();
    }

    render() {
        const { line1, line2, icon, time = 0, id, onSelect, readOnly, ...restProps } = this.props;

        const onTimeChange = (value: string) => {
            if (store.timesheets.registration && store.timesheets.registration) {
                store.timesheets.registration.time = +value;
                store.timesheets.saveSelectedRegistration();
                store.timesheets.setSelectedRegistration(undefined);
            }
        }

        const onCancel = () => {
            store.timesheets.setSelectedRegistration(undefined);
        };

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

        const isEditing = store.timesheets.registration && store.timesheets.registrationId === id;
        const timeJSX2 = <EditableTextField
            ref={this.timeInputEl}
            editMode={!!isEditing}
            edit={{
                onChange: onTimeChange,
                onCancel,
                value: (time || 0).toFixed(2),
                type: "number",
            }}
        />;

        const selectJSX = onSelect
            ? <div className="registration-line-select">
                <Checkbox onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                }}
                    checked={store.view.selection.has(id)}
                    onChange={onSelect}
                ></Checkbox>
            </div>
            : null;

        const styles = classNames("registration-line",
            {
                "registration-line--readonly": readOnly
            });

        return <div className={styles} {...restProps}>
            <div className="registration-line-header">
                {iconJSX}
            </div>

            <div className="registration-line-time" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                store.timesheets.setSelectedRegistration(id);
            }}>
                {timeJSX2}
            </div>

            <div className="registration-line-content">
                {line1JSX}
                {line2JSX}
            </div>

            {selectJSX}
        </div>
    }
}