import { Octokit } from "@octokit/rest";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useFirebase } from "../contexts/firebase-context";
import { useOAuthUser } from "../hooks/use-gapi/use-oauth-user";
import { Token } from "../oauth/use-oauth";
import Cookies from "js-cookie";
import { useCallback, useEffect } from "react";

function isToken(result: { error: string, error_description: string, error_uri: string } | Token): result is Token {
    return !(result as any).error;
}

export function useGithubOauth({
    scope,
}: {
    scope?: string | null;
} = {}) {
    const firebase = useFirebase();
    const functions = getFunctions(firebase);

    const getAccessToken = useCallback(async ({ code }) => {

        const getAccessTokenFn = await httpsCallable<
            { code: string; providerId: string },
            { error: string, error_description: string, error_uri: string } | Token
        >(
            functions,
            "getAccessToken",
        );

        const accessTokenResponse = await getAccessTokenFn({
            code,
            providerId: "github"
        });

        if (!isToken(accessTokenResponse.data)) {
            throw new Error(`${accessTokenResponse.data.error}: ${accessTokenResponse.data.error_description}`);
        }

        return accessTokenResponse.data;
    }
        , []
    );
    const result = useOAuthUser({
        scope,
        providerId: "github",
        getAccessToken,
        revokeAccessToken: async ({ accessToken }) => {
            const revokeFn = await httpsCallable<
                { token: string; providerId: string },
                string
            >(
                functions,
                "revokeGithubAccessToken",
            );

            await revokeFn({
                token: accessToken,
                providerId: "github",
            });
        },
        getUser: async (token) => {
            const octokit = new Octokit({
                auth: token,
            });

            const response = await octokit.users.getAuthenticated();

            return response.data;
        },
        initialAccessToken: Cookies.get()["github-token"]
    });

    const token = result.oauth.accessToken;
    useEffect(
        () => {
            if (token) {
                // TODO: encrypt tokens before storing in cookie
                Cookies.set(
                    "github-token",
                    token,
                    {
                        sameSite: "strict",
                        secure: true,
                    }
                );
            } else {
                Cookies.remove("github-token");
            }
        },
        [
            token,
        ]
    )

    return result;
}