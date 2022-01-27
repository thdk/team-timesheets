import React from "react";


import fs from "fs";
import path from "path";

import { Store } from "../../../stores/root-store";
import { RegistrationLines } from "./registration-lines";
import { render, waitFor } from "@testing-library/react";
import { Doc } from "firestorable";
import { IRegistration } from "../../../../common";
import userEvent from "@testing-library/user-event";
import { initializeTestEnvironment, RulesTestEnvironment, } from "@firebase/rules-unit-testing";
import { useStore } from "../../../contexts/store-context";
import { User } from "firebase/auth";

let store: Store;
let clientId: string;
let taskIds: string[];
let projectId: string;
const userId = "user-1";

const setupAsync = async () => {
    store = new Store({
        firestore,
    });

    await store.auth.addDocument({
        divisionId: "",
        name: "User 1",
        recentProjects: [],
        roles: {
            user: true,
        },
        tasks: new Map(),
        uid: userId,
        githubRepos: [],
    }, userId);

    taskIds = await Promise.all([
        store.tasks.addDocument(
            {
                name: "Task 1",
                icon: "people",
            },
        ),
        store.tasks.addDocument(
            {
                name: "Task 2",
            },
        )
    ]);
    clientId = await store.config.clientsCollection.addAsync(
        {
            name: "Client 1",
        },
    );

    projectId = await store.projects.addDocument(
        {
            name: "Project 1",
            icon: "people",
        },
    );

    store.auth.setUser({
        uid: userId,
        displayName: "user 1",
        email: "email@email.com",
    } as User);
};

let testEnv: RulesTestEnvironment;
let firestore: any;

beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
        projectId: "registrations-line-test",
        firestore: {
            rules: fs.readFileSync(path.resolve(__dirname, "../../../../firestore.rules.test"), "utf8"),
        }
    });

    firestore = testEnv.unauthenticatedContext().firestore();
});

beforeEach(async () => {
    await setupAsync();
    (useStore as jest.Mock<ReturnType<typeof useStore>>).mockReturnValue(store);
});

afterEach(async () => {
    store.dispose();
    await testEnv.clearFirestore();
});

afterAll(() => testEnv.cleanup());

jest.mock("../../../contexts/store-context");

describe("RegistrationLines", () => {
    const getRegistrations = () => [
        {
            data: {
                userId: userId,
                client: clientId,
                project: projectId,
                task: taskIds[0],
                description: "Registration 1",
                date: new Date(2020, 2, 22),
            },
            id: "reg-1",
        },
        {
            data: {
                userId: userId,
                client: clientId,
                project: projectId,
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
        await waitFor(() => expect(store.auth.activeDocument).toBeTruthy());

        await waitFor(() => expect(store.config.clientsCollection.isFetched).toBeTruthy());
        await waitFor(() => expect(store.tasks.collection.isFetched).toBeTruthy());
        const { asFragment, unmount, } = render(
            <RegistrationLines
                registrations={getRegistrations()}
            />
        );

        await waitFor(() => expect(asFragment()).toMatchSnapshot());

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

    it("should not call registration click during an inline edit of a registration", async () => {
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

        const timeEl = container.querySelectorAll<HTMLDivElement>(".registration-line__time")[0];

        expect(timeEl).toBeDefined();

        if (timeEl) {
            userEvent.click(timeEl);
        }

        await waitFor(() => expect(timeEl?.querySelector("input[type=text]")).toBeDefined());

        userEvent.click(getByText("Client 1 - Registration 2"));

        expect(registrationClick).not.toBeCalledWith("reg-2");

        unmount();
    });
});