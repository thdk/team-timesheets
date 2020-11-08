import React from "react";
import { render, fireEvent } from "@testing-library/react";

import { ITask } from "../../../../common";
import { useUserStore } from "../../../contexts/user-context";
import { useUserStoreMock } from "../../../contexts/user-context/__mocks__";
import { TaskPreferences } from "./task-preferences";
import { useTasks } from "../../../contexts/task-context";

jest.mock('../../../contexts/user-context');
jest.mock('../../../contexts/task-context');

const resetMocks = () => {
    (useTasks as jest.Mock<ReturnType<typeof useTasks>>).mockReturnValue({
        tasks: [] as ITask[],
    } as ReturnType<typeof useTasks>);

    (useUserStore as jest.Mock<ReturnType<typeof useUserStore>>).mockReturnValue(
        useUserStoreMock
    );
}

beforeEach(resetMocks);
afterAll(resetMocks);

describe("TaskPreferences", () => {
    it("should not render without tasks", () => {
        const { asFragment } = render(
            <TaskPreferences />
        );

        expect(asFragment()).toMatchSnapshot();
    });

    it("should not render without authenticated user", () => {
        (useUserStore as jest.Mock<ReturnType<typeof useUserStore>>).mockReturnValue(
            {
                ...useUserStoreMock,
                divisionUser: undefined,
            }
        );
        const { asFragment } = render(
            <TaskPreferences />
        );

        expect(asFragment()).toMatchSnapshot();
    });

    it("should render tasks", () => {
        (useTasks as jest.Mock<ReturnType<typeof useTasks>>).mockReturnValue({
            tasks: [
                {
                    id: "task-1",
                    name: "Task 1",
                },
                {
                    id: "task-2",
                    name: "Task 2",
                },
            ],
        } as ReturnType<typeof useTasks>);

        const { asFragment } = render(
            <TaskPreferences />
        );

        expect(asFragment()).toMatchSnapshot();
    });

    it("should show default task", () => {
        (useUserStore as jest.Mock<ReturnType<typeof useUserStore>>).mockReturnValue(
            {
                ...useUserStoreMock,
                divisionUser: {
                    ...useUserStoreMock.divisionUser,
                    defaultTask: "task-1",
                    tasks: new Map([["task-1", true], ["task-2", true]]),
                }
            }
        );

        (useTasks as jest.Mock<ReturnType<typeof useTasks>>).mockReturnValue({
            tasks: [
                {
                    id: "task-1",
                    name: "Task 1",
                },
                {
                    id: "task-2",
                    name: "Task 2",
                },
            ],
        } as ReturnType<typeof useTasks>);

        const { asFragment } = render(
            <TaskPreferences />
        );

        expect(asFragment()).toMatchSnapshot();
    });

    it("should call updateDivisionUser when default task is changed", () => {
        const updateDivisionUser = jest.fn();

        const originalMock = jest.requireMock('../../../contexts/user-context').useUserStore();
        (useUserStore as jest.Mock<ReturnType<typeof useUserStore>>).mockReturnValue(
            {
                ...originalMock,
                updateDivisionUser,
                divisionUser: {
                    ...originalMock.divisionUser,
                    tasks: new Map([["task-1", true], ["task-2", true]]),
                },
            }
        );

        (useTasks as jest.Mock<ReturnType<typeof useTasks>>).mockReturnValue({
            tasks: [
                {
                    id: "task-1",
                    name: "Task 1",
                },
                {
                    id: "task-2",
                    name: "Task 2",
                },
            ],
        } as ReturnType<typeof useTasks>);

        const { container } = render(
            <TaskPreferences />
        );

        const chipEl = Array.from(
            container.querySelectorAll(".mdc-chip-set--choice .mdc-chip__text")
        ).find(el => el.innerHTML === "Task 1");

        fireEvent.click(chipEl!);

        expect(updateDivisionUser).toHaveBeenCalledWith({
            defaultTask: "task-1",
        });
    });

    it("should call updateDivisionUser when task is added to filter", () => {
        const updateDivisionUser = jest.fn();
        const originalMock = jest.requireMock('../../../contexts/user-context').useUserStore();
        (useUserStore as jest.Mock<ReturnType<typeof useUserStore>>).mockReturnValue(
            {
                ...originalMock,
                updateDivisionUser,
            }
        );

        (useTasks as jest.Mock<ReturnType<typeof useTasks>>).mockReturnValue({
            tasks: [
                {
                    id: "task-1",
                    name: "Task 1",
                },
                {
                    id: "task-2",
                    name: "Task 2",
                },
            ],
        } as ReturnType<typeof useTasks>);

        const { getByText } = render(
            <TaskPreferences />
        );

        fireEvent.click(getByText("Task 1"));

        expect(updateDivisionUser).toHaveBeenCalledWith({
            tasks: new Map<string, true>([["task-1", true]]),
        });
        expect(updateDivisionUser).toHaveBeenCalledTimes(1);

        // Call it twice to see if it only run once
        fireEvent.click(getByText("Task 1"));
        expect(updateDivisionUser).toHaveBeenCalledTimes(1);
    });

    it("should call updateDivisionUser when task is removed from filter", () => {
        const updateDivisionUser = jest.fn();
        const originalMock = jest.requireMock('../../../contexts/user-context').useUserStore();
        (useUserStore as jest.Mock<ReturnType<typeof useUserStore>>).mockReturnValue(
            {
                ...originalMock,
                updateDivisionUser,
                divisionUser: {
                    ...originalMock.divisionUser,
                    tasks: new Map([["task-1", true]])
                },
            }
        );

        (useTasks as jest.Mock<ReturnType<typeof useTasks>>).mockReturnValue({
            tasks: [
                {
                    id: "task-1",
                    name: "Task 1",
                },
                {
                    id: "task-2",
                    name: "Task 2",
                },
            ],
        } as ReturnType<typeof useTasks>);

        const { getByText } = render(
            <TaskPreferences />
        );

        fireEvent.click(getByText("Task 1"));

        expect(updateDivisionUser).toHaveBeenCalledWith({
            tasks: new Map(),
        });
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
