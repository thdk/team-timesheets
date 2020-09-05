import React from "react"
import { DataRow } from "../../components/data-row";


export const GoogleCalendarEvents = ({
    events,
}: {
    events: gapi.client.calendar.Event[],
}) => {
    return (
        <div>
            {events.map((event) => {
                return (
                    <DataRow
                        key={event.id}
                        line1={event.summary}
                        line2={event.description}
                        icon={"add_circle_outline"}
                    />
                );
            })}
        </div>
    );
};