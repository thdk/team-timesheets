import React from "react";
import type firebase from "firebase";

import fs from "fs";
import path from "path";

import { Store } from "../../../stores/root-store";
import { RegistrationLines } from "./registration-lines";
import { render, waitFor } from "@testing-library/react";
import { Doc } from "firestorable";
import { IRegistration } from "../../../../common";
import userEvent from "@testing-library/user-event";
import { initializeTestApp, loadFirestoreRules, clearFirestoreData, } from "@firebase/rules-unit-testing";
import { useStore } from "../../../contexts/store-context";

const projectId = "registrations-line-test";

const app = initializeTestApp({
    projectId,
});

let store: Store;
let clientIds: string[];
let taskIds: string[];
let projectIds: string[];
const userId = "user-1";
const setupAsync = async () => {
    store = new Store({
        firestore: app.firestore(),
    });

    await store.auth.addDocument({
        divisionId: "",
        name: "User 1",
        recentProjects: [],
        roles: {
            user: true,
        },
        tasks: new Map(),
        uid: "user-1",
    }, "user-1");

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

    store.auth.setUser({
        uid: userId,
        displayName: "user 1",
        email: "email@email.com",
    } as firebase.User);
};

beforeAll(async () => {
    await loadFirestoreRules({
        projectId,
        rules: fs.readFileSync(path.resolve(__dirname, "../../../../firestore.rules.test"), "utf8"),
    });
});

beforeEach(async () => {
    await setupAsync();
    (useStore as jest.Mock<ReturnType<typeof useStore>>).mockReturnValue(store);
});

afterEach(async () => {
    store.dispose();
    await clearFirestoreData({
        projectId,
    });
});

afterAll(() => app.delete());

jest.mock("../../../contexts/store-context");

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
        const { asFragment, unmount, } = render(
            <RegistrationLines
                registrations={[]}
            />
        );

        expect(asFragment()).toMatchSnapshot();

        unmount();
    });

    it("should render registrations", async () => {
        await waitFor(() => expect(store.auth.activeDocument).toBeDefined());

        await waitFor(() => expect(store.config.clientsCollection.isFetched).toBeTruthy());
        const { asFragment, unmount, } = render(
            <RegistrationLines
                registrations={getRegistrations()}
            />
        );

        expect(asFragment()).toMatchSnapshot();
        
        unmount();
    });

    it("should show checkbox for each registration when registrationToggleSelect is provided", async () => {
        await waitFor(() => expect(store.auth.activeDocument).toBeDefined());

        const registrationToggleSelect = jest.fn();
        const { container, unmount, } = render(
            <RegistrationLines
                registrations={getRegistrations()}
                registrationToggleSelect={registrationToggleSelect}
            />
        );

        expect(
            container.querySelectorAll("input[type=checkbox]").length
        ).toBe(3);

        unmount();
    });

    it("should call callbacks for registration click and select", async () => {
        const registrationToggleSelect = jest.fn();
        const registrationClick = jest.fn();

        await waitFor(() => expect(store.auth.activeDocument).toBeDefined());

        const { container, getByText, unmount, } = render(
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

        unmount();
    });
});