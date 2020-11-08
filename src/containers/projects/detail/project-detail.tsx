import React, { useCallback } from "react";
import { TextField } from "@rmwc/textfield";

import { Form, FormField } from "../../../components/layout/form";
import { FlexGroup } from "../../../components/layout/flex";
import UserSelect from "../../users/select";
import IconPicker from "../../../components/icon-picker";

type Props = {
    readonly onNameChanged: (name: string) => void;
    readonly onIconChanged: (icon: string) => void;
    readonly onOwnerChanged: (userId: string) => void;
    readonly icon?: string;
    readonly name?: string;
    readonly ownerId?: string;
}

const ProjectDetail = (props: Props) => {

    const {
        icon,
        name,
        ownerId,
        onOwnerChanged,
        onIconChanged,
        onNameChanged,
    } = props;

    const handleNameChanged = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onNameChanged(e.target.value);
    }, [onNameChanged]);

    const handleIconChanged = useCallback((icon: string) => {
        onIconChanged(icon);
    }, [onIconChanged]);

    return <>
        <Form>
            <FlexGroup extraCssClass="row">
                <FormField>
                    <TextField
                        outlined
                        label="Name"
                        value={name}
                        onChange={handleNameChanged}
                    />
                </FormField>
                <FormField first={false}>
                    <IconPicker
                        onChange={handleIconChanged}
                        value={icon}
                        outlined
                    />
                </FormField>
            </FlexGroup>
            <FlexGroup extraCssClass="row">
                <FormField>
                    <UserSelect
                        label={"Project owner"}
                        value={ownerId}
                        onChange={onOwnerChanged}
                    />
                </FormField>
            </FlexGroup>
        </Form>
    </>;
};

export default ProjectDetail;