import React from "react";
import { render } from "@testing-library/react";
import { Preferences } from "./";
import { useTasks } from "../../../contexts/task-context";
import { useClients } from "../../../contexts/client-context";
import { ITask, IClient } from "../../../../common";
import { useUserStore } from "../../../contexts/user-context";
import { useUserStoreMock } from "../../../contexts/user-context/__mocks__";

jest.mock('../../../contexts/user-context');
jest.mock('../../../contexts/auth-context');
jest.mock('../../../contexts/task-context');
jest.mock('../../../contexts/client-context');

jest.mock('./task-preferences', jest.fn().mockReturnValue(({
    TaskPreferences: () => <>TaskPreferences</>
})));
jest.mock('./client-preferences', jest.fn().mockReturnValue(({
    ClientPreferences: () => <>ClientPreferences</>
})));

const resetMocks = () => {
    (useTasks as jest.Mock<ReturnType<typeof useTasks>>).mockReturnValue({
        tasks: [] as ITask[],
    } as ReturnType<typeof useTasks>);

    (useClients as jest.Mock<ReturnType<typeof useClients>>).mockReturnValue({
        clients: [] as IClient[],
    } as ReturnType<typeof useClients>);

    (useUserStore as jest.Mock<ReturnType<typeof useUserStore>>).mockReturnValue(
        useUserStoreMock
    );
}

beforeEach(resetMocks);
afterAll(resetMocks);

describe("Preferences", () => {
    it("should display a message when no clients or tasks has been added", () => {
        const { asFragment } = render(
            <Preferences />
        );

        expect(asFragment()).toMatchSnapshot();
    });

    it("should display task preferences", () => {
        (useTasks as jest.Mock<ReturnType<typeof useTasks>>).mockReturnValue({
            tasks: [
                {
                    id: "task-1",
                    name: "Task 1 ",
                },
                {
                    id: "task-2",
                    name: "Task 2 ",
                    icon: "people",
                },
                {
                    id: "task-3",
                    name: "Task 3 ",
                    icon: "code",
                },
            ],
        } as ReturnType<typeof useTasks>);

        const { asFragment } = render(
            <Preferences />
        );

        expect(asFragment()).toMatchSnapshot();
    });

    it("should display client preferences", () => {
        (useClients as jest.Mock<ReturnType<typeof useClients>>).mockReturnValue({
            clients: [{
                id: "client-1",
            }],
        } as ReturnType<typeof useClients>);

        const { asFragment } = render(
            <Preferences />
        );

        expect(asFragment()).toMatchSnapshot();
    });

    it("should not render when unauthenticated", () => {
        (useUserStore as jest.Mock<ReturnType<typeof useUserStore>>).mockReturnValue({
            divisionUser: undefined,
        } as ReturnType<typeof useUserStore>);

        const { asFragment } = render(
            <Preferences />
        );

        expect(asFragment()).toMatchSnapshot();
    })
});
