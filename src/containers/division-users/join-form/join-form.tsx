import React, { useCallback, ChangeEvent, useState, } from "react";
import { TextField } from "@rmwc/textfield";
import { Button } from "@rmwc/button";

import { FormField, Form } from "../../../components/layout/form";
import { queue } from "../../../components/snackbar";
import { useDivisionStore } from "../../../contexts/division-context";

import "./join-form.scss";

export const DivisionJoinform = () => {
    const [value, setValue] = useState<string>("");
    const division = useDivisionStore();

    const handleOnChange = useCallback((e: ChangeEvent) => {
        const target = (e.target as HTMLInputElement);
        setValue(target.value);
    }, [setValue]);

    const handleOnClick = () => {
        if (value) {
            setValue("");
            division.joinDivision(
                value,
                (message) => {
                    queue.notify({
                        title: message,
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
