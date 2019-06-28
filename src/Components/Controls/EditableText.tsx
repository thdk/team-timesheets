import * as React from 'react';
import { TextFieldOld, ITextFieldProps } from '../../mdc/textfield';

export interface IEditableTextFieldProps {
    readonly edit: ITextFieldProps & { onCancel?: () => void; },
    readonly read?: React.HTMLProps<HTMLDivElement>,
    readonly editMode: boolean,
}

const EditableTextField = React.forwardRef((props: IEditableTextFieldProps, ref?: any) => {
    const { editMode, edit: { value, onChange, onCancel } } = props;
    const [textFieldValue, setTextFieldValue] = React.useState(value);

    const onInputChange = (value: string) => {
        setTextFieldValue(value);
    };

    const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        switch (e.key) {
            case "Enter":
                onChange && onChange((e.currentTarget as HTMLInputElement).value);
                break;
            case "Escape":
                onCancel && onCancel();
                break;
            default:
                break;
        }
    };

    const onFocus = (e: React.FocusEvent) => {
        const textBoxEl = (e.currentTarget as HTMLInputElement);
        textBoxEl.setSelectionRange(0, textBoxEl.value.length);
    };

    const onBlur = (e: React.FocusEvent) => {
        const textBoxEl = (e.currentTarget as HTMLInputElement);
        onChange && onChange(textBoxEl.value);
    };

    const jsx = editMode
        ? <TextFieldOld onBlur={onBlur} onFocus={onFocus} dense={true} focus={true} onKeyPress={onKeyPress} onChange={onInputChange} ref={ref} value={textFieldValue}></TextFieldOld>
        : <>{value}</>;

    return jsx;
});

export default EditableTextField;