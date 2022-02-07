import React, { PropsWithChildren } from "react";
import { AuthContext, AuthContextData } from "./oauth-context";

export const OauthProvider = ({
    children,
    providers,
}: PropsWithChildren<{
    providers: AuthContextData[],
}>) => {
    return (
        <AuthContext.Provider value={providers}>
            {children}
        </AuthContext.Provider>
    );
};
