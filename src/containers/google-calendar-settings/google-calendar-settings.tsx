import { Button } from "@rmwc/button";
import { observer } from "mobx-react-lite";
import React from "react";
import { useGapiAuth } from "../../hooks/use-gapi";
import { useGoogleConfig } from "../configs/use-google-config";

const GoogleButton = observer(
    () => {
        const config = useGoogleConfig();

        const {
            signIn,
            signOut,
            isInitialized: isGapiLoaded,
            user,
        } = useGapiAuth(config);

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
    }
);

export const GoogleCalendarSettings = () => {
    return (
        <>
            <h3 className="mdc-typography--subtitle1">Google calendar</h3>
            <p>When connected with Google Calendar, you'll receive suggestions to add you events from you calendar directly into your timesheet.</p>
            <GoogleButton />
        </>
    );
};
