import React from "react";

import { Store } from "../../../stores/root-store";
import { initTestFirestore, deleteFirebaseAppsAsync } from "../../../__tests__/utils/firebase";
import { RegistrationLines } from "./registration-lines";
import { render, waitFor } from "@testing-library/react";
import { Doc } from "firestorable";
import { IRegistration, IUserData } from "../../../../common";
import userEvent from "@testing-library/user-event";
import { useStore } from "../../../contexts/store-context";

const {
    firestore,
    clearFirestoreDataAsync,
    refs: [
        usersRef
    ]
} = initTestFirestore(
    "registrations-line-test",
    [
        "users",
    ]
);

const store = new Store({
    firestore,
});

jest.mock("../../../contexts/store-context");

let clientIds: string[];
let taskIds: string[];
let projectIds: string[];
const userId = "user-1";
const setupAsync = async () => {
    await usersRef.doc(userId).set({
        name: "User 1",
    } as Partial<IUserData>
    );
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

    projectIds = await store.projects.addDocuments([
        {
            name: "Project 1",
            icon: "people",
        },
    ]);

    store.user.setUser({
        uid: userId,
        displayName: "user 1",
        email: "email@email.com",
    } as firebase.User);
};

beforeAll(async () => {
    (useStore as jest.Mock<ReturnType<typeof useStore>>).mockReturnValue(store);
    await clearFirestoreDataAsync();
    await setupAsync();
});
afterAll(() => {
    store.dispose();
    return Promise.all([
        deleteFirebaseAppsAsync(),
    ]);
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

    it("should render registrations", async () => {
        await waitFor(() => expect(store.user.authenticatedUser).toBeDefined());

        await waitFor(() => expect(store.config.clientsCollection.isFetched).toBeTruthy());
        const { asFragment } = render(
            <RegistrationLines
                registrations={getRegistrations()}
            />
        );

        expect(asFragment()).toMatchSnapshot();
    });

    it("should show checkbox for each registration when registrationToggleSelect is provided", async () => {
        await waitFor(() => expect(store.user.authenticatedUser).toBeDefined());

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

    it("should call callbacks for registration click and select", async () => {
        const registrationToggleSelect = jest.fn();
        const registrationClick = jest.fn();

        await waitFor(() => expect(store.user.authenticatedUser).toBeDefined());

        const { container, getByText } = render(
            <RegistrationLines
                registrations={getRegistrations()}
                registrationToggleSelect={registrationToggleSelect}
                registrationClick={registrationClick}
            />
        );

        await waitFor(() => getByText("Client 1 - Registration 2"));

        const checkboxEl = container.querySelectorAll("input[type=checkbox]")[0];

        userEvent.click(checkboxEl);

        expect(registrationToggleSelect).toBeCalledWith("reg-1");


        userEvent.click(getByText("Client 1 - Registration 2"));

        expect(registrationClick).toBeCalledWith("reg-2");
    });
});