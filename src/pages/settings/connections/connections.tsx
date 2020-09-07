import React from "react";
import { useGapi } from "../../../hooks/use-gapi";
import { useGoogleConfig } from "../../../containers/configs/use-google-config";
import { Button } from "@rmwc/button";
import { Box } from "../../../components/layout/box";

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
    return (
        <Box>
            <h3 className="mdc-typography--subtitle1">Google calendar</h3>
            <p>When connected with Google Calendar, you'll receive suggestions to add you events from you calendar directly into your timesheet.</p>
            <GoogleButton />
        </Box>
    );
};