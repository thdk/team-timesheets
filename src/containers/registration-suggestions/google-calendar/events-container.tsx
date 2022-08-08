import { observer } from "mobx-react-lite";
import React from "react";
import { useCallback } from "react";
import { IRegistration } from "../../../../common";
import { useRegistrationStore } from "../../../contexts/registration-context";
import { useTasks } from "../../../contexts/task-context";
import { GoogleCalendarEvents as GoogleCalendarEventsView } from "./events";
import { useGoogleCalendarEvents } from "./use-google-calendar-events";

const SOURCE_ID = "google-calendar";

export const GoogleCalendarEvents = observer(({
    onClick,
}: {
    onClick: (registration: Partial<IRegistration>) => void,
}) => {
    const timesheets = useRegistrationStore();
    const tasks = useTasks()

    const handleEventClick = useCallback(
        (event: gapi.client.calendar.Event) => {
            const start = new Date((event.start?.date || event.start?.dateTime) as string);
            const end = event.start?.date || !event.end?.dateTime ? undefined : new Date(event.end.dateTime);
            onClick({
                date: start,
                description: event.summary,
                time: end ? Math.abs(end.getTime() - start.getTime()) / 3600000 : undefined,
                task: tasks.tasks.find(t => t.name === "Meeting")?.id,
                source: SOURCE_ID,
                sourceId: event.id!,
            });
        },
        [tasks, timesheets]
    );

    const eventsQuery = useGoogleCalendarEvents();


    return eventsQuery.hasData
        ? (

            <GoogleCalendarEventsView
                events={eventsQuery.data}
                onClick={handleEventClick}
            />
        )
        : null;
});
