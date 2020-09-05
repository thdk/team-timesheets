import React from "react";
import { useGapi } from "../../../hooks/use-gapi";
import { useGoogleConfig } from "../../../containers/configs/use-google-config";

export const Connections = () => {
    const config = useGoogleConfig();

    const {
        signIn,
        isGapiLoaded,
        user,
    } = useGapi(config);

    if (isGapiLoaded) {
        if (user) {
            return (
                <input
                    type="button"
                    onClick={gapi.auth2.getAuthInstance().signOut}
                    value="signout"
                />
            )
        } else {
            return (
                <input type="button" onClick={signIn} value="Connect google calendar" />
            )
        }
    } else {
        return null;
    }
}