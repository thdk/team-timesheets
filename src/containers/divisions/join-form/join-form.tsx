import React, { useRef, useCallback, ChangeEvent } from "react";
import { TextField } from "@rmwc/textfield";
import { Button } from "@rmwc/button";
import { FormField, Form } from "../../../components/layout/form";

import "./join-form.scss";
import { useUserStore } from "../../../contexts/user-context";
import firebase from "firebase/app";

export const DivisionJoinform = () => {
    const value = useRef("");
    const user = useUserStore();

    const handleOnChange = useCallback((e: ChangeEvent) => {
        const target = (e.target as HTMLInputElement);
        value.current = target.value;
    }, []);

    const handleOnClick = useCallback(() => {
        if (value.current) {
            firebase.functions().httpsCallable("getDivisionByEntryCode")(value.current)
                .then(({ data: divisionId }) => {
                    if (!divisionId) {
                        return;
                    }

                    user.divisionUsersCollection.addAsync(
                        {
                            ...user.authenticatedUser!,
                            divisionId,
                            roles: {
                                user: true
                            },
                        },
                    ).then((divisionUserId) => {
                        user.updateAuthenticatedUser({
                            divisionUserId,
                            divisionId,
                        });
                    });
                });

        }

    }, []);
    return (
        <div className="division-join">
            <div className="division-join__info">
                <p>
                    Join an existing division
                </p>
            </div>
            <Form className="division-join__form">
                <FormField>
                    <TextField
                        label="Division entry code"
                        outlined
                        defaultValue={value.current}
                        onChange={handleOnChange}
                    />
                </FormField>
                <FormField
                    first={false}
                >
                    <Button
                        outlined
                        onClick={handleOnClick}
                    >
                        Join
                    </Button>
                </FormField>
            </Form>
        </div>
    );
};
DivisionJoinform.displayName = "DivisionJoinform";
