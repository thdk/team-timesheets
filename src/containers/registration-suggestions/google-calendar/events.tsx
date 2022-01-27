import React from "react"
import { FormattedTime } from "react-intl";

import { DataRow, DataRowColumn, DataRowLine1, DataRowLine2 } from "../../../components/data-row";

import "./events.scss";
import { Icon } from "@rmwc/icon";

export const GoogleCalendarEvents = ({
    events,
    onClick,
}: {
    events: gapi.client.calendar.Event[];
    onClick: (event: gapi.client.calendar.Event) => void;
}) => {
    if (!events.length) {
        return null;
    }

    return (
        <>            
            {events.map((event) => {
                return (
                    <DataRow
                        key={event.id}
                        icon={<Icon title="Google Calendar" icon={"event"} />}
                        onClick={() => onClick(event)}
                    >
                        <DataRowColumn
                            style={{
                                flexGrow: 1,
                            }}
                        >
                            <DataRowLine1>
                                {event.summary}
                            </DataRowLine1>
                            <DataRowLine2>
                                {event.description}
                            </DataRowLine2>
                        </DataRowColumn>

                        <DataRowColumn
                            className={"events__time"}
                        >
                            {event.start?.date
                                ? null
                                : (
                                    <>
                                        <FormattedTime value={event.start?.dateTime} />
                                        {` - `}
                                        <FormattedTime value={event.end?.dateTime} />
                                    </>
                                )
                            }

                        </DataRowColumn>
                    </DataRow>
                );
            })}
        </>
    );
};