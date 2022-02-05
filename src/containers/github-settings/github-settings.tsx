import { Button } from "@rmwc/button";
import { TextField } from "@rmwc/textfield";
import React, { useEffect, useState } from "react";
import { FlexGroup } from "../../components/layout/flex";
import { Form, FormField } from "../../components/layout/form";
import { useUserStore } from "../../contexts/user-context";
import { useGithubOauth } from "../../oauth-providers/use-github-oauth";

export function GithubSettings() {
    const userStore = useUserStore();
    const [githubRepo, setGithubRepo] = useState<string>(userStore.divisionUser?.githubRepos[0] || "");

    const oauthGithubResult = useGithubOauth();

    const repo = userStore.divisionUser?.githubRepos[0] || "";
    useEffect(
        () => {
            setGithubRepo(repo);
        },
        [
            repo,
        ]
    );

    const handleSaveGithub = () => {

        userStore.updateDivisionUser({
            githubRepos: [githubRepo],
        });
    }

    const githubUsername = oauthGithubResult.data?.login;
    useEffect(
        () => {
            userStore.updateDivisionUser({
                githubUsername: ``
            })
        },
        [
            githubUsername,
            userStore,
        ],
    );

    const loading = oauthGithubResult.isLoading || oauthGithubResult.oauth.accessToken === undefined;

    return (
        <>
            <h3 className="mdc-typography--subtitle1">Github</h3>
            <p>Easily add time registrations based on what you have committed on Github.</p>
            <Form>
                {oauthGithubResult.data
                    ? (
                        <>
                            <FlexGroup className="row">
                                <FormField first>
                                    <TextField
                                        disabled={loading}
                                        size={40}
                                        type="string"
                                        outlined={true}
                                        value={githubRepo}
                                        id="github-repo"
                                        label="Github repo"
                                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setGithubRepo(event.currentTarget.value)}
                                    />
                                </FormField>
                            </FlexGroup>
                            <FlexGroup className="row">
                                <FormField
                                    first
                                >
                                    <Button
                                        disabled={loading}
                                        onClick={handleSaveGithub}
                                        outlined
                                    >
                                        Save github settings
                                    </Button>
                                </FormField>
                                <FormField
                                    first={false}
                                >
                                    <Button
                                        disabled={loading}
                                        onClick={() => oauthGithubResult.oauth.revoke()}
                                    >
                                        Disconnect from Github
                                    </Button>
                                </FormField>
                            </FlexGroup>
                        </>
                    )
                    : (
                        <FlexGroup className="row">
                            <FormField>
                                <Button
                                    disabled={loading}
                                    onClick={() => oauthGithubResult.oauth.login()}
                                    outlined
                                >
                                    Connect with Github
                                </Button>
                            </FormField>
                        </FlexGroup>
                    )
                }

            </Form >
        </>
    )
}
