import React, { PropsWithChildren } from "react";
import { useConfig } from "../containers/configs/use-config";
import { AuthContext, AuthContextData } from "../oauth/oauth-context";

export const OauthProvider = ({
    children,
}: PropsWithChildren<unknown>) => {
    const clientId = useConfig("github-client-id");

    const providers: AuthContextData[] = [
        {
            clientId: clientId || "",
            id: "github",
            authorizeUrl: "https://github.com/login/oauth/authorize",
            redirectUrl: `${window.location.protocol}//${window.location.host}/profile?tab=connections`,
        }
    ];

    return clientId !== undefined
        ? (
            <AuthContext.Provider value={providers}>
                {children}
            </AuthContext.Provider>
        )
        : null;
};

