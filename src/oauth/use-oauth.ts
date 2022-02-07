import { useCallback, useEffect, useState } from "react";
import { useOAuthProvider } from "./use-oauth-provider";

export type Token = { access_token: string; scope: string; type: string; };

export const useOAuth = (
    {
        providerId,
        getAccessToken,
        revokeAccessToken,
        initialAccessToken,
    }: {
        initialAccessToken?: string;
        getAccessToken: (request: {
            code: string;
        }) => Promise<Token>;
        providerId: string;
        revokeAccessToken: (request: {
            accessToken: string;
            clientId: string;
        }) => Promise<void>;
    }
) => {
    const {
        clientId,
        authorizeUrl,
        redirectUrl = window.location.href
    } = useOAuthProvider(providerId);

    const [accessToken, setAccessToken] = useState<string | undefined | null>(initialAccessToken || null);

    const urlSearchParams = new URLSearchParams(window.location.search);
    const initialAthorizationCode = urlSearchParams.get("provider") === providerId
        ? urlSearchParams.get("code")
        : undefined;

    // remove the used authorisation code from the url
    urlSearchParams.delete("code");
    window.history.replaceState(
        {},
        document.title,
        `${window.location.href.split('?')[0]}?${urlSearchParams.toString()}`
    );


    const [authorizationCode] = useState<string | undefined>(initialAthorizationCode || undefined);

    useEffect(
        () => {
            if (!authorizationCode) {
                return;
            }

            setAccessToken(undefined);
            getAccessToken({
                code: authorizationCode,
            }).then((token) => {
                setAccessToken(token.access_token);
            }).catch((error) => {
                setAccessToken(null);
                console.error(error);
            });
        },
        [
            authorizationCode,
            getAccessToken,
        ],
    );

    const oauthRedirectUri = `${redirectUrl.indexOf('?') > -1 ? "&" : "?"}provider=${encodeURIComponent(providerId)}`

    const login = useCallback(
        () => {
            window.location.replace(
                `${authorizeUrl}?client_id=${clientId}&redirect_uri=${oauthRedirectUri}`
            );
        },
        [
            authorizeUrl,
            clientId,
            oauthRedirectUri,
        ],
    );

    const revoke = useCallback(
        () => {
            if (accessToken) {
                setAccessToken(undefined);
                revokeAccessToken({
                    accessToken,
                    clientId,
                }).then(() => {
                    setAccessToken(null);
                }).catch((error) => {
                    setAccessToken(accessToken);
                    console.error("Failed to revoke access token");
                    console.error(error);
                });
            }
        },
        [
            accessToken
        ],
    );

    return {
        accessToken,
        login,
        revoke,
        setAccessToken,
    };
}
