import * as React from 'react';
import { Checkbox } from '@rmwc/checkbox';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';

import EditableTextField from '../../../components/editable-text';
import { useRegistrationStore } from '../../../contexts/registration-context';
import { useViewStore } from '../../../stores/view-store';

import "./registration-line.scss";

export interface IRegistrationLineProps extends React.HTMLProps<HTMLDivElement> {
    readonly line1: string;
    readonly line2?: string;
    readonly icon?: string;
    readonly taskName: string;
    readonly time?: number;
    readonly id: string;
    readonly onSelect?: () => void;
}

export const RegistrationLine = observer(({
    line1,
    line2,
    icon,
    taskName,
    time = 0,
    id,
    onSelect,
    readOnly,
    ...restProps
}: IRegistrationLineProps) => {

    const timesheets = useRegistrationStore();
    const view = useViewStore();

    const onTimeChange = (value: string) => {
        if (timesheets.registration && timesheets.registration) {
            timesheets.registration.time = +value;
            timesheets.saveSelectedRegistration();
            timesheets.setSelectedRegistration(undefined);
        }
    }

    const onCancel = () => {
        timesheets.setSelectedRegistration(undefined);
    };

    const iconJSX = icon
        ? <span className="icon material-icons" aria-hidden="true" title={taskName}>{icon}</span>
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

    const isEditing = timesheets.registration && timesheets.registrationId === id;
    const timeJSX2 = <EditableTextField
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
                checked={view.selection.has(id)}
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
            timesheets.setSelectedRegistration(id);
        }}>
            {timeJSX2}
        </div>

        <div className="registration-line-content">
            {line1JSX}
            {line2JSX}
        </div>

        {selectJSX}
    </div>
});
