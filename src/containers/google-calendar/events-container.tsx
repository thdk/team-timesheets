import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";

import { useGapi } from "../../hooks/use-gapi";
import { useViewStore } from "../../stores/view-store";
import { useGoogleConfig } from "../configs/use-google-config";

import { GoogleCalendarEvents as PureGoogleCalendarEvents } from "./events";
import { useRegistrationStore } from "../../contexts/registration-context";
import { goToNewRegistration } from "../../routes/registrations/detail";
import { useRouterStore } from "../../stores/router-store";
import { useTasks } from "../../contexts/task-context";

export const GoogleCalendarEvents =
    observer(({
        excludedIds = [],
    }: {
        excludedIds?: string[];
    }) => {
        const [events, setEvents] = useState<gapi.client.calendar.Event[] | undefined>();

        const view = useViewStore();

        const config = useGoogleConfig();

        const tasks = useTasks();

        const timesheet = useRegistrationStore();

        const router = useRouterStore();

        const handleEventClick = (event: gapi.client.calendar.Event) => {
            const start = new Date((event.start?.date || event.start?.dateTime) as string);
            const end = event.start?.date ? undefined : new Date(event.end?.dateTime!);
            timesheet.setSelectedRegistrationDefault({
                date: start,
                description: event.summary,
                time: end ? Math.abs(end.getTime() - start.getTime()) / 3600000 : undefined,
                task: tasks.tasks.find(t => t.name === "Meeting")?.id,
                source: "google-calendar",
                sourceId: event.id!,
            });
            goToNewRegistration(router);
        };

        const {
            user,
            isGapiLoaded,
        } = useGapi(config);

        useEffect(() => {
            if (isGapiLoaded && user) {
                gapi.client.calendar.events.list({
                    'calendarId': 'primary',
                    'timeMin': view.moment.clone().startOf("day").toISOString(),
                    'timeMax': view.moment.clone().endOf("day").toISOString(),
                    'showDeleted': false,
                    'maxResults': 10,
                    'singleEvents': true,
                    'orderBy': 'startTime',
                }).then(response => {
                    setEvents(response.result.items);
                });
            }
        }, [user, isGapiLoaded, view.moment]);

        const filteredEvents = (events || []).filter(
            event => excludedIds.indexOf(event.id!) === -1
        );

        const EventsHeader = () => {
            return filteredEvents.length
                ? (
                    <div style={{
                        paddingLeft: "1em",
                        marginTop: "2em",
                    }}>
                        <h3
                            className="mdc-typography--subtitle2"
                            style={{ fontWeight: 400 }}
                        >
                            Suggestions for this timesheet:
                        </h3>
                    </div>
                )
                : null;
        }

        return isGapiLoaded
            ? (
                user
                    ? (
                        <>
                            <EventsHeader />
                            <PureGoogleCalendarEvents
                                events={filteredEvents}
                                onClick={handleEventClick}
                            />
                        </>
                    )
                    : null
            )
            : null;
    });