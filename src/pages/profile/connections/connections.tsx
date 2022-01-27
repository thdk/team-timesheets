import React, { useEffect, useState } from "react";
import { ListDivider } from "@rmwc/list";
import { Button } from "@rmwc/button";
import { TextField } from "@rmwc/textfield";

import { Box } from "../../../components/layout/box";
import { FlexGroup } from "../../../components/layout/flex";
import { Form, FormField } from "../../../components/layout/form";

import { useGapi } from "../../../hooks/use-gapi";
import { useGoogleConfig } from "../../../containers/configs/use-google-config";
import { useUserStore } from "../../../contexts/user-context";

const GoogleButton = () => {
    const config = useGoogleConfig();

    const {
        signIn,
        signOut,
        isGapiLoaded,
        user,
    } = useGapi(config);

    if (!isGapiLoaded) {
        return null;
    }

    if (!!user) {
        return (
            <Button
                onClick={signOut}
            >
                Disconnect from google
            </Button>
        )
    } else {
        return (
            <Button
                onClick={signIn}
            >
                Connect with google
            </Button>
        )
    }
};

export const Connections = () => {
    const userStore = useUserStore();
    const [githubRepo, setGithubRepo] = useState<string>(userStore.divisionUser?.githubRepos[0] || "");
    const [githubUsername, setGithubUsername] = useState<string>(userStore.divisionUser?.githubUsername || "");
    const [githubToken, setGithubToken] = useState<string>(userStore.divisionUser?.githubToken || "");

    useEffect(
        () => {
            setGithubRepo(userStore.divisionUser?.githubRepos[0] || "");
            setGithubUsername(userStore.divisionUser?.githubUsername || "");
            setGithubToken(userStore.divisionUser?.githubToken || "");
        },
        [
            userStore.divisionUser,
        ]
    )
    const handleSaveGithub = () => {

        userStore.updateDivisionUser({
            githubRepos: [githubRepo],
            githubUsername,
            githubToken,
        });
    }

    return (
        <Box>
            <h3 className="mdc-typography--subtitle1">Google calendar</h3>
            <p>When connected with Google Calendar, you'll receive suggestions to add you events from you calendar directly into your timesheet.</p>
            <GoogleButton />

            <ListDivider
                style={{
                    margin: "1em 0 1em 0"
                }}
            />
            <h3 className="mdc-typography--subtitle1">Github</h3>

            <p>Easily add time registrations based on what you have committed on Github.</p>
            <Form>
                <FlexGroup extraCssClass="row">
                    <FormField>
                        <TextField
                            type="string"
                            outlined={true}
                            value={githubUsername}
                            id="github-user"
                            label="Github username"
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setGithubUsername(event.currentTarget.value)}
                        />
                    </FormField>
                    <FormField first={false}>
                        <TextField
                            type="string"
                            outlined={true}
                            value={githubRepo}
                            id="github-repo"
                            label="Github repo"
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setGithubRepo(event.currentTarget.value)}
                        />
                    </FormField>
                </FlexGroup>
                <FlexGroup extraCssClass="row">
                    <FormField>
                        <TextField
                            type="password"
                            outlined={true}
                            value={githubToken}
                            id="github-user"
                            label="Github personal access token"
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setGithubToken(event.currentTarget.value)}
                        />
                    </FormField>
                </FlexGroup>
                <FlexGroup extraCssClass="row">
                    <Button
                        onClick={handleSaveGithub}
                        style={{ margin: "1em" }}
                        outlined
                    >
                        Save github settings
                    </Button>
                </FlexGroup>
            </Form>
        </Box>
    );
};