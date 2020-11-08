import React from "react";

import { render } from "@testing-library/react";
import { RegistrationDetail } from "./registration-detail";
import { useUserStore } from "../../../contexts/user-context";
import { useRegistrationStore } from "../../../contexts/registration-context";
import { IRegistration } from "../../../../common";
import { useTasks } from "../../../contexts/task-context";
import { useClients } from "../../../contexts/client-context";
import { useProjectStore } from "../../../contexts/project-context";


jest.mock("../../../contexts/user-context", () => ({
    useUserStore: jest.fn(),
}));

jest.mock("../../../contexts/task-context");
jest.mock("../../../contexts/registration-context");
jest.mock("../../../contexts/client-context");
jest.mock("../../../contexts/project-context");

beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const tasks = new Map();
    tasks.set("task-1", true);
    tasks.set("task-3", true);
    (useUserStore as any).mockReturnValue({
        divisionUser: {
            id: "user-1",
            roles: {},
            tasks,
            recentProjects: [],
        },
    });
    (useClients as any).mockReturnValue({
        clients: [],
    });
    (useProjectStore as any).mockReturnValue({
        activeProjects: [],
        archivedProjects: [],
    });
});

describe("RegistrationDetail", () => {
    it("should not render when there is no authenticated user", () => {
        (useRegistrationStore as any).mockReturnValue({});
        (useUserStore as any).mockReturnValue({
            divisionUser: undefined,
        });
        const { asFragment } = render(<RegistrationDetail />);

        expect(asFragment()).toMatchSnapshot();
    });


    it("should not render when there is no registration", () => {
        (useRegistrationStore as any).mockReturnValue({});

        const { asFragment } = render(<RegistrationDetail />);

        expect(asFragment()).toMatchSnapshot();
    });

    it("should render when there is a registration", () => {
        (useRegistrationStore as any).mockReturnValue({
            activeDocument: {
                date: new Date(2020, 2, 1),
                isPersisted: true,
                userId: "user-1",
                description: "Registration 1",
                task: "task-1",
            } as IRegistration,
        });

        (useTasks as any).mockReturnValue({
            tasks: [{
                id: "task-1",
                name: "Task 1",
            }],
        });

        const { asFragment } = render(<RegistrationDetail />);

        expect(asFragment()).toMatchSnapshot();
    });

    it("should only show user tasks instead of all tasks", () => {
        (useRegistrationStore as any).mockReturnValue({
            activeDocument: {
                date: new Date(2020, 2, 1),
                isPersisted: true,
                userId: "user-1",
                description: "Registration 1",
                task: "task-1",
            } as IRegistration,
        });

        (useTasks as any).mockReturnValue({
            tasks: [
                {
                    id: "task-1",
                    name: "Task 1",
                },
                {
                    id: "task-2",
                    name: "Task 2",
                },
                {
                    id: "task-3",
                    name: "Task 3",
                },
            ],
        });

        const { asFragment } = render(<RegistrationDetail />);

        expect(asFragment()).toMatchSnapshot();
    });
});
