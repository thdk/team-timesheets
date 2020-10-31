import React, { useCallback, ChangeEvent, useState, } from "react";
import firebase from "firebase/app";
import { TextField } from "@rmwc/textfield";
import { Button } from "@rmwc/button";

import { FormField, Form } from "../../../components/layout/form";
import { useUserStore } from "../../../contexts/user-context";
import { queue } from "../../../components/snackbar";
import { useDivisionStore } from "../../../contexts/division-context";

import "./join-form.scss";

export const DivisionJoinform = () => {
    const [value, setValue] = useState<string>("");
    const user = useUserStore();
    const division = useDivisionStore();

    const handleOnChange = useCallback((e: ChangeEvent) => {
        const target = (e.target as HTMLInputElement);
        setValue(target.value);
    }, [setValue]);

    const handleOnClick = () => {
        if (value) {
            setValue("");
            firebase.functions().httpsCallable("getDivisionByEntryCode")(value)
                .then(({ data: divisionId }) => {
                    if (!divisionId) {
                        return Promise.reject(
                            new Error("unknown-division"),
                        );
                    }

                    if (division.userDivisions
                        .some(d => d.id === divisionId)
                    ) {
                        return Promise.reject(
                            new Error("already-in-division"),
                        )
                    }

                    return user.divisionUsersCollection.addAsync(
                        {
                            ...user.authenticatedUser!,
                            divisionId,
                            roles: {
                                user: true
                            },
                        },
                    ).then(
                        (divisionUserId) => {
                            return user.updateAuthenticatedUser({
                                divisionUserId,
                                divisionId,
                            });
                        },
                    );
                })
                .then(
                    () => {
                        queue.notify({
                            title: `Successfully joined this division`,
                        });
                    }, (e: Error) => {
                        let title: string;
                        switch (e.message) {
                            case "already-in-division":
                                title = "You are already in this division";
                                break;

                            default:
                                title = "You can't join this division";
                                break;
                        }
                        queue.notify({
                            title,
                        });
                    },
                );
        }
    };

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
                        value={value}
                        onChange={handleOnChange}
                    />
                </FormField>
                <FormField
                    first={false}
                >
                    <Button
                        outlined
                        onClick={handleOnClick}
                        disabled={!value}
                    >
                        Join
                    </Button>
                </FormField>
            </Form>
        </div>
    );
};
DivisionJoinform.displayName = "DivisionJoinform";
