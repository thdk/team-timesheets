import * as React from 'react';
import { useState } from 'react';
import TextField, { HelperText, Input, Props } from '@material/react-text-field/dist/index';
import MaterialIcon from '@material/react-material-icon';

export interface IIconPickerProps {
    textfield?: Partial<Pick<HTMLInputElement, "value">>
    & Omit<Props, "children" | "trailingIcon" | "leadingIcon" | "helperText">
    & { editIcon?: string, helperTextValue?: string },
    input: Omit<React.HTMLProps<HTMLInputElement>, "onChange">,
    onChange: (icon: string) => void;
};

const IconPicker: React.SFC<IIconPickerProps> = (props: IIconPickerProps) => {
    const {
        value
    } = props.input;

    const {
        helperTextValue = undefined,
        label = null,
        outlined = false,
        editIcon = "edit",
        ...restTextField
    } = props.textfield || {};

    const { onChange } = props;

    const [state, setState] = useState({
        isOpen: false,
        icon: (value || '').toString()
    });

    const { isOpen, icon } = state;

    return (<>
        <TextField
            onTrailingIconSelect={() => setState({ icon, isOpen: true })}
            outlined={true}
            label={(label || "Icon").toString()}
            {...restTextField}
        ><Input
                value={icon}
                onChange={(e: React.FormEvent<HTMLInputElement>) => {
                    setState({ icon: e.currentTarget.value, isOpen: false });
                }} />
        </TextField>
    </>
    );
};

IconPicker.defaultProps = {};

export default IconPicker;