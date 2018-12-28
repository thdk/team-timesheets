import * as React from 'react';
import { IListItemProps, ListItem } from '../../MaterialUI/list';
import { FlexGroup } from '../Layout/flex';
import { FormField } from '../Layout/form';
import { TextField } from '../../MaterialUI/textfield';
import { Button } from '../../MaterialUI/buttons';

export interface IListItemData { icon?: string, name?: string };

interface IState {
    data?: IListItemData;
}

export interface IAddListItemLabels {
    add?: string;
    cancel?: string;
    save?: string;
}

export interface IAddListItemProps extends IListItemProps {
    data?: IListItemData;
    onSave: (data: IListItemData) => void;
    onCancel?: () => void;
    labels?: IAddListItemLabels;
}

export class AddListItem extends React.Component<IAddListItemProps, IState> {
    constructor(props: IAddListItemProps) {
        super(props);
        this.state = { data: props.data };
    }

    render() {
        const {labels: {save: saveLabel = "Save", cancel: cancelLabel = "Cancel", add: addLabel = "Add item"} = {}} = this.props;
        if (this.state.data) {
            const { icon, name } = this.state.data;

            const input = <FlexGroup style={{ alignItems: "center" }}>
                <FormField>
                    <TextField value={icon} onChange={this.changeIcon.bind(this)} hint="Icon" id="task-icon-text"></TextField>
                </FormField>
                <FormField first={false}>
                    <TextField value={name} onChange={this.changeName.bind(this)} hint="Name" id="task-name-text"></TextField>
                </FormField>
                <FormField first={false}>
                    <Button onClick={this.save.bind(this)}>{saveLabel}</Button>
                </FormField>
                <FormField first={false}>
                    <Button onClick={this.cancel.bind(this)}>{cancelLabel}</Button>
                </FormField>
            </FlexGroup>;

            return <ListItem disabled={true} lines={[input]} icon={icon || "add"}></ListItem>
        } else {
            return <ListItem  disabled={true} icon="add" lines={[<a href="#" onClick={this.newItem.bind(this)} >{addLabel}</a>]}></ListItem>;
        }
    }

    changeName(name: string) {
        this.setState({ data: { ...this.state.data, name } });
    }

    changeIcon(icon: string) {
        this.setState({ data: { ...this.state.data, icon } });
    }

    cancel() {
        this.setState({data: undefined});
        this.props.onCancel && this.props.onCancel();
    }

    newItem() {
        this.setState({ ...this.state, data: {} });
    }

    save() {
        const { name = "", icon = "" } = this.state.data || {};
        this.props.onSave({ name, icon });
        this.setState({data: undefined});
    }
}