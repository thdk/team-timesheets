import React, { useCallback } from "react";
import { TextField } from "@rmwc/textfield";

import { Form, FormField } from "../../../components/layout/form";
import { FlexGroup } from "../../../components/layout/flex";
import { IFavoriteRegistration } from "../../../../common/dist";
import { RegistrationLines } from "../../registrations/lines";
import { Doc } from "firestorable";

type Props = {
    readonly onNameChanged: (name: string) => void;
    readonly name?: string;
    readonly favorites: Doc<IFavoriteRegistration>[];
}

const FavoriteGroupDetail = (props: Props) => {

    const {
        name,
        onNameChanged,
        favorites,
    } = props;

    const handleNameChanged = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onNameChanged(e.target.value);
    }, [onNameChanged]);

    return <>
        <div style={{ paddingLeft: "2em", paddingTop: "1em" }}>
            <h3 className="mdc-typography--subtitle1">
                Favorite group details
            </h3>
        </div>
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
        <div style={{ paddingLeft: "2em" }}>
            <h3 className="mdc-typography--subtitle1">
                Included registrations
                </h3>
        </div>
        <hr className="mdc-list-divider" />
        <div>
            <RegistrationLines
                readOnly={true}
                registrationClick={() => { }}
                registrations={favorites}
            ></RegistrationLines>
        </div>
        <hr className="mdc-list-divider" />
    </>;
};

export default FavoriteGroupDetail;
