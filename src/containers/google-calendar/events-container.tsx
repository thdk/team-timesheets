import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";

import { useGapi } from "../../hooks/use-gapi";
import { useViewStore } from "../../stores/view-store";
import { useGoogleConfig } from "../configs/use-google-config";

import { GoogleCalendarEvents as PureGoogleCalendarEvents } from "./events";

export const GoogleCalendarEvents =
    observer(() => {
        const [events, setEvents] = useState<gapi.client.calendar.Event[] | undefined>();

        const view = useViewStore();

        const config = useGoogleConfig();
        const {
            user,
            signIn,
            isGapiLoaded,
        } = useGapi(config);

        useEffect(() => {
            if (user && isGapiLoaded) {
                gapi.client.calendar.events.list({
                    'calendarId': 'primary',
                    'timeMin': view.moment.clone().startOf("day").toISOString(),
                    'timeMax': view.moment.clone().endOf("day").toISOString(),
                    'showDeleted': false,
                    'maxResults': 10,
                }).then(response => {
                    setEvents(response.result.items);
                });
            }
        }, [user, view.moment, isGapiLoaded]);

        return isGapiLoaded
            ? (
                user && events
                    ? (
                        <div>
                            <PureGoogleCalendarEvents
                                events={events}
                            />
                        </div>
                    )
                    : <input type="button" onClick={signIn} value="Connect google calendar" />
            )
            : null;
    });