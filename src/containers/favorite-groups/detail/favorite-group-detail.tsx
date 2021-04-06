import React, { useState, useCallback } from "react";
import { Form, FormField } from "../../../components/layout/form";
import { FlexGroup } from "../../../components/layout/flex";
import { TextField } from "@rmwc/textfield";
import { IFavoriteRegistrationGroup } from "../../../../common";
import { FavoriteGroupSelect } from "../select";
import { Checkbox } from "@rmwc/checkbox";

export const FavoriteGroupDetailForm = ({
    groups,
    group: {
        name,
        id,
    },
    onNameChanged,
}: {
    groups: (IFavoriteRegistrationGroup & { id: string })[];
    group: Partial<(IFavoriteRegistrationGroup & { id: string })>,
    onNameChanged: (name: string) => void,
}) => {

    const [overwriteExistingGroup, setOverwriteExistingGroup] = useState(false);
    const [newId, setNewId] = useState(id);

    const handleIdChanged = useCallback((id: string) => {
        const existingGroup = groups.find((group) => group.id === id);
        if (existingGroup) {
            onNameChanged(existingGroup.name);
        }
        setNewId(id);
    }, [groups]);

    return (
        <Form style={{ paddingBottom: 0, paddingTop: "1em" }}>
            <FlexGroup extraCssClass="row">
                <FormField>
                    {groups && overwriteExistingGroup
                        ? (
                            <FavoriteGroupSelect
                                onChange={handleIdChanged}
                                value={newId}
                            />
                        ) : (
                            <TextField
                                autoFocus={true}
                                outlined
                                label="Name"
                                value={name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onNameChanged(e.target.value)}
                            />

                        )}
                </FormField>
                <FormField
                    first={false}
                >
                    <Checkbox
                        label="Overwrite existing"
                        checked={overwriteExistingGroup}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setOverwriteExistingGroup(e.target.checked);
                        }}
                    >

                    </Checkbox>
                </FormField>

            </FlexGroup>
        </Form>
    );
};
