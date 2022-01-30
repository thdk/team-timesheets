import { Button } from "@rmwc/button";
import { TextField } from "@rmwc/textfield";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { FlexGroup } from "../../components/layout/flex";
import { Form, FormField } from "../../components/layout/form";
import { useUserStore } from "../../contexts/user-context";

export const JiraSettings = observer(function JiraSettings() {
    const userStore = useUserStore();

    const [jiraUsername, setJiraUsername] = useState<string>(userStore.divisionUser?.jiraUsername || "");
    const [jiraPassword, setJiraPassword] = useState<string>(userStore.divisionUser?.jiraPassword || "");

    useEffect(
        () => {
            setJiraUsername(userStore.divisionUser?.jiraUsername || "");
            setJiraPassword(userStore.divisionUser?.jiraPassword || "");
        },
        [
            userStore.divisionUser,
        ]
    )
    const handleSaveJira = () => {

        userStore.updateDivisionUser({
            jiraUsername,
            jiraPassword,
        });
    }

    return (
        <>
            <h3 className="mdc-typography--subtitle1">Jira</h3>
            <p>Track updates from your Jira board.</p>
            <p>Note: your password is currrently saved as plain text in our database. PR is welcome to fix this.</p>
            <Form>
                <FlexGroup extraCssClass="row">
                    <FormField>
                        <TextField
                            type="string"
                            outlined={true}
                            value={jiraUsername}
                            id="jira-user"
                            label="Jira username"
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setJiraUsername(event.currentTarget.value)}
                        />
                    </FormField>
                </FlexGroup>
                <FlexGroup extraCssClass="row">
                    <FormField>
                        <TextField
                            type="password"
                            outlined={true}
                            value={jiraPassword}
                            id="jira-password"
                            label="Jira password"
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setJiraPassword(event.currentTarget.value)}
                        />
                    </FormField>
                </FlexGroup>
                <FlexGroup extraCssClass="row">
                    <Button
                        onClick={handleSaveJira}
                        style={{ margin: "1em" }}
                        outlined
                    >
                        Save Jira settings
                    </Button>
                </FlexGroup>
            </Form>
        </>
    )
});
