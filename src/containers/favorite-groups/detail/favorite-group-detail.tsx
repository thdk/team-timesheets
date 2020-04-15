import React, { useCallback } from "react";
import { Form, FormField } from "../../../components/layout/form";
import { FlexGroup } from "../../../components/layout/flex";
import { TextField } from "@rmwc/textfield";

export const FavoriteGroupDetailForm = ({
    name,
    onNameChanged,
}: {
    name?: string,
    onNameChanged: (name: string) => void,
}) => {
    const handleNameChanged = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onNameChanged(e.target.value);
    }, [onNameChanged]);

    return (
        <Form style={{ paddingBottom: 0, paddingTop: "1em" }}>
            <FlexGroup extraCssClass="row">
                <FormField>
                    <TextField
                        autoFocus={true}
                        outlined
                        label="Name"
                        value={name}
                        onChange={handleNameChanged}
                    />
                </FormField>

            </FlexGroup>
        </Form>
    );
};