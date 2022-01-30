import { useQuery } from "react-query";
import { useRegistrationStore } from "../../../contexts/registration-context";
import { useViewStore } from "../../../contexts/view-context";
import { useGapiAuth } from "../../../hooks/use-gapi";
import { useGoogleConfig } from "../../configs/use-google-config";

const SOURCE_ID = "google-calendar";

export function useGoogleCalendarEvents(
    options?: Parameters<typeof gapi.client.calendar.events.list>[0],
) {
    const config = useGoogleConfig();
    const view = useViewStore();
    const timesheets = useRegistrationStore();

    const {
        user,
    } = useGapiAuth(config);

    const excludedIds = timesheets.dayRegistrations.registrations
        .reduce<string[]>(
            (p, c) => {
                if (c.data?.sourceId && SOURCE_ID) {
                    p.push(c.data.sourceId)
                }
                return p;
            },
            [],
        );

    const queryResult = useQuery<Awaited<ReturnType<typeof gapi.client.calendar.events.list>>>(
        [
            "events",
            options,
            view.startOfDay?.toISOString(),
            view.endOfDay?.toISOString(),
        ],
        () => {
            return gapi.client.calendar.events.list({
                'calendarId': 'primary',
                'timeMin': view.startOfDay?.toISOString(),
                'timeMax': view.endOfDay?.toISOString(),
                'showDeleted': false,
                'maxResults': 10,
                'singleEvents': true,
                'orderBy': 'startTime',
                ...options,
            });
        },
        {
            enabled: user && !!view.startOfDay,
        },
    );

    const filteredEvents = queryResult.isSuccess
        ? (queryResult.data.result.items || []).filter((event) => excludedIds.indexOf(event.id!) === -1)
        : [];

    return {
        ...queryResult,
        hasData: filteredEvents.length > 0,
        data: filteredEvents,
    }
}