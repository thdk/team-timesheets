import * as React from 'react';
import { Checkbox } from '@rmwc/checkbox';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import { Icon } from '@rmwc/icon';

import EditableTextField from '../../../components/editable-text';
import { useRegistrationStore } from '../../../contexts/registration-context';
import { useViewStore } from '../../../contexts/view-context';

import { DataRow, DataRowColumn, DataRowLine1, DataRowLine2 } from '../../../components/data-row';

import "./registration-line.scss";
import { transaction } from 'mobx';
import { Theme } from '@rmwc/theme';

export interface IRegistrationLineProps extends React.HTMLProps<HTMLDivElement> {
    readonly line1: string;
    readonly line2?: string;
    readonly icon?: { icon: string, title: string };
    readonly time?: number;
    readonly id: string;
    readonly onSelect?: () => void;
}

export const RegistrationLine = observer(({
    line1,
    line2,
    icon,
    time = 0,
    id,
    onSelect,
    readOnly,
    ...restProps
}: IRegistrationLineProps) => {

    const timesheets = useRegistrationStore();
    const view = useViewStore();

    const onTimeChange = (value: string) => {
        transaction(() => {
            if (timesheets.activeDocument) {
                timesheets.activeDocument.time = +value;
                timesheets.saveSelectedRegistration();
            }
        });
    }

    const onCancel = () => {
        timesheets.setActiveDocumentId(undefined);
    };

    const isEditing = timesheets.activeDocument && timesheets.activeDocumentId === id;
    const timeJSX2 = (
        <DataRowColumn
            className="registration-line__time"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                timesheets.setActiveDocumentId(id);
            }}
        >
            <EditableTextField
                editMode={!!isEditing}
                edit={{
                    onChange: onTimeChange,
                    onCancel,
                    value: (time || 0).toFixed(2),
                    type: "number",
                }}
            />
        </DataRowColumn>
    );

    const selectJSX = onSelect
        ? <DataRowColumn className="data-row__select">
            <Checkbox onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
            }}
                checked={view.selection.has(id)}
                onChange={onSelect}
            />
        </DataRowColumn>
        : null;

    const styles = classNames(
        "registration-line",
        {
            "registration-line--readonly": readOnly
        },
    );

    return (
        <DataRow
            allowEmptyHeader
            className={styles}
            icon={icon ? <Icon theme={["textIconOnBackground"]} title={icon.title} icon={icon.icon} /> : null}
            {...restProps}
        >
            {timeJSX2}
            <DataRowColumn
                className="registration-line__content"
            >
                <DataRowLine1>
                    <Theme use={["textSecondaryOnBackground"]}>
                        {line1}
                    </Theme>
                </DataRowLine1>
                <DataRowLine2>
                    {line2}
                </DataRowLine2>
            </DataRowColumn>
            {selectJSX}
        </DataRow>
    );
});
