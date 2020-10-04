import React from "react";
import { render } from "@testing-library/react";

import { useClients } from "../../../contexts/client-context";
import { IClient } from "../../../../common";
import { useUserStore } from "../../../contexts/user-context";
import { useUserStoreMock } from "../../../contexts/user-context/__mocks__";
import { ClientPreferences } from "./client-preferences";

jest.mock('../../../contexts/user-context');
jest.mock('../../../contexts/client-context');

const resetMocks = () => {
    (useClients as jest.Mock<ReturnType<typeof useClients>>).mockReturnValue({
        clients: [] as IClient[],
    } as ReturnType<typeof useClients>);

    (useUserStore as jest.Mock<ReturnType<typeof useUserStore>>).mockReturnValue(
        useUserStoreMock
    );
}

beforeEach(resetMocks);
afterAll(resetMocks);

describe("ClientPreferences", () => {
    it("should not render without clients", () => {
        const { asFragment } = render(
            <ClientPreferences />
        );

        expect(asFragment()).toMatchSnapshot();
    });

    it("should render clients", () => {
        (useClients as jest.Mock<ReturnType<typeof useClients>>).mockReturnValue({
            clients: [
                {
                    id: "client-1",
                    name: "Client 1",
                },
                {
                    id: "client-2",
                    name: "Client 2",
                },
            ],
        } as ReturnType<typeof useClients>);

        const { asFragment } = render(
            <ClientPreferences />
        );

        expect(asFragment()).toMatchSnapshot();
    });

    // it("should call updateDivision user when client is changed", async () => {
    //     const updateDivisionUser = jest.fn();
    //     (useUserStore as jest.Mock<ReturnType<typeof useUserStore>>).mockReturnValue(
    //         {
    //             ...useUserStoreMock,
    //             updateDivisionUser
    //         },
    //     );

    //     (useClients as jest.Mock<ReturnType<typeof useClients>>).mockReturnValue({
    //         clients: [
    //             {
    //                 id: "client-1",
    //                 name: "Client 1",
    //             },
    //             {
    //                 id: "client-2",
    //                 name: "Client 2",
    //             },
    //         ],
    //     } as ReturnType<typeof useClients>);

    //     const { container, getByText } = render(
    //         <ClientPreferences />
    //     );

    //     const selectEl = container.querySelector("select");
    //     expect(selectEl).toBeDefined();

    //     userEvent.selectOptions(selectEl!, getByText("Client 2"));

    //     await waitFor(() => expect(updateDivisionUser).toBeCalled());
    // });
});
