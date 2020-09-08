import React from "react";

import { Store } from "../../../stores/root-store";
import { initTestFirestore, deleteFirebaseAppsAsync } from "../../../__tests__/utils/firebase";
import { RegistrationLines } from "./registration-lines";
import { render } from "@testing-library/react";
import { Doc } from "firestorable";
import { IRegistration } from "../../../../common";
import userEvent from "@testing-library/user-event";

const {
    firestore,
    clearFirestoreDataAsync,
} = initTestFirestore("registrations-line-test");

const store = new Store({
    firestore,
});

jest.mock("../../../contexts/store-context", () => ({
    useStore: () => store,
}));

let clientIds: string[];
let taskIds: string[];
let projectIds: string[];

const setupAsync = async () => {
    taskIds = await store.config.tasksCollection.addAsync([
        {
            name: "Task 1",
            icon: "people",
        },
        {
            name: "Task 2",
        },
    ]);
    clientIds = await store.config.clientsCollection.addAsync([
        {
            name: "Client 1",
        },
    ]);

    projectIds = await store.projects.projectsCollection.addAsync([
        {
            name: "Project 1",
            icon: "people",
        },
    ]);
};

beforeAll(async () => {
    await clearFirestoreDataAsync();
    await setupAsync();
});
afterAll(() => {
    store.dispose();
    return Promise.all([
        deleteFirebaseAppsAsync(),
    ])
});

describe("RegistrationLines", () => {
    const getRegistrations = () => [
        {
            data: {
                userId: "user-1",
                client: clientIds[0],
                project: projectIds[0],
                task: taskIds[0],
                description: "Registration 1",
                date: new Date(2020, 2, 22),
            },
            id: "reg-1",
        },
        {
            data: {
                userId: "user-1",
                client: clientIds[0],
                project: projectIds[0],
                task: taskIds[2],
                description: "Registration 2",
                date: new Date(2020, 2, 22),
                time: 7.5
            },
            id: "reg-2",
        },
        {
            data: {},
            id: "reg-3",
            time: 7.555
        },
        {
            id: "reg-4",
        },
    ] as Doc<IRegistration>[];

    it("should render without registrations", () => {
        const { asFragment } = render(
            <RegistrationLines
                registrations={[]}
            />
        );

        expect(asFragment()).toMatchSnapshot();
    });

    it("should render registrations", () => {
        const { asFragment } = render(
            <RegistrationLines
                registrations={getRegistrations()}
            />
        );

        expect(asFragment()).toMatchSnapshot();
    });

    it("should show checkbox for each registration when registrationToggleSelect is provided", () => {
        const registrationToggleSelect = jest.fn();
        const { container } = render(
            <RegistrationLines
                registrations={getRegistrations()}
                registrationToggleSelect={registrationToggleSelect}
            />
        );

        expect(
            container.querySelectorAll("input[type=checkbox]").length
        ).toBe(3);
    });

    it("should call callbacks for registration click and select", () => {
        const registrationToggleSelect = jest.fn();
        const registrationClick = jest.fn();

        const { container, getByText } = render(
            <RegistrationLines
                registrations={getRegistrations()}
                registrationToggleSelect={registrationToggleSelect}
                registrationClick={registrationClick}
            />
        );

        const checkboxEl = container.querySelectorAll("input[type=checkbox]")[0];

        userEvent.click(checkboxEl);

        expect(registrationToggleSelect).toBeCalledWith("reg-1");

        userEvent.click(getByText("Client 1 - Registration 2"));

        expect(registrationClick).toBeCalledWith("reg-2");
    });
});