import React from "react";
import { TextField } from "@rmwc/textfield";
import { FormField, Form } from "../../../components/layout/form";
import { Button } from "@rmwc/button";

import "./join-form.scss";

export const DivisionJoinform = () => {
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
                    />
                </FormField>
                <FormField
                    first={false}
                >
                    <Button
                        outlined
                    >
                        Join
                    </Button>
                </FormField>
            </Form>
        </div>
    );
};
DivisionJoinform.displayName = "DivisionJoinform";
