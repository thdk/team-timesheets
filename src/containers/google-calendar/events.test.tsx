import React from "react";
import { GoogleCalendarEvents } from "./events";
import { render, fireEvent } from "@testing-library/react";
import { IntlProvider } from "react-intl";

export const events = [
    {
        id: "event-1",
        summary: "Summary 1",
        start: {
            date: "2020-03-22",
        },
        description: "All day event 1",
    },
    {
        id: "event-2",
        summary: "Summary 2",
        start: {
            dateTime: "2020-03-22T12:00:00Z",
        },
        end: {
            dateTime: "2020-03-22T14:00:00Z",
        },
    }
] as gapi.client.calendar.Event[];
describe("GoogleCalendarEvents", () => {
    it("should render without events", () => {
        const { asFragment } = render(<GoogleCalendarEvents
            events={[]}
            onClick={jest.fn()}
        />);

        expect(asFragment()).toMatchSnapshot();
    });


    it("should display events", () => {
        const { asFragment } = render(
            <IntlProvider
                timeZone={"Europe/Brussels"}
                locale={"en-US"}
            ><GoogleCalendarEvents
                    events={events}
                    onClick={jest.fn()}
                />
            </IntlProvider>
        );

        expect(asFragment()).toMatchSnapshot();
    });

    it("should call onClick when event is clicked", () => {
        const onClick = jest.fn();

        const { getByText } = render(
            <IntlProvider
                locale={"en-US"}
                timeZone={"Europe/Brussels"}
            ><GoogleCalendarEvents
                    events={events}
                    onClick={onClick}
                />
            </IntlProvider>
        );

        fireEvent.click(getByText("Summary 1"));

        expect(onClick).toBeCalledWith({
            id: "event-1",
            summary: "Summary 1",
            start: {
                date: "2020-03-22",
            },
            description: "All day event 1",
        })
    });

});