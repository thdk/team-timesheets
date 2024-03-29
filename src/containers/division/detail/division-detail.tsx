import React, { useCallback } from "react";
import { TextField } from "@rmwc/textfield";

import { Form, FormField } from "../../../components/layout/form";
import { FlexGroup } from "../../../components/layout/flex";
import IconPicker from "../../../components/icon-picker";
import { Box } from "../../../components/layout/box";

type Props = {
    readonly onNameChanged: (name: string) => void;
    readonly onIconChanged: (icon: string) => void;
    readonly icon?: string;
    readonly name?: string;
}

export const DivisionDetail = (props: Props) => {
    const {
        icon = "",
        name = "",
        onIconChanged,
        onNameChanged,
    } = props;

    const handleNameChanged = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onNameChanged(e.target.value);
    }, [onNameChanged]);

    const handleIconChanged = useCallback((icon: string) => {
        onIconChanged(icon);
    }, [onIconChanged]);

    return (
        <Box>
            <Form>
                <FlexGroup className="row">
                    <FormField>
                        <TextField
                            outlined
                            label="Name"
                            value={name}
                            className="division-detail__name"
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
            </Form>
        </Box>
    );
};
DivisionDetail.displayName = "DivisionDetail";