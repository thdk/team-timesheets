import React from "react";
import fs from "fs";
import path from "path";
import type firebase from "firebase";

import { DivisionDetail } from "./";
import { render, waitFor, act, fireEvent } from "@testing-library/react";
import { initializeTestApp, loadFirestoreRules, clearFirestoreData } from "@firebase/rules-unit-testing";
import { Store } from "../../../stores/root-store";
import { useStore } from "../../../contexts/store-context";

const projectId = "division-detail-container";
const app = initializeTestApp({
    projectId,
});

jest.mock("../../../contexts/store-context");

beforeAll(async () => {
    await loadFirestoreRules({
        projectId,
        rules: fs.readFileSync(path.resolve(__dirname, "../../../../firestore.rules.test"), "utf8"),
    });
});

let store: Store;
beforeEach(async () => {
    store = new Store({
        firestore: app.firestore(),
    });

    await store.user.usersCollection.addAsync(
        {
            name: "user 1",
            team: "team-1",
            roles: {
                user: true,
            },
            divisionId: "",
            recentProjects: [],
            tasks: new Map(),
            uid: "user-1",
        },
        "user-1",
    );

    store.auth.setUser({
        uid: "user-1",
        displayName: "user 1",
        email: "email@email.com",
    } as firebase.User);

    await store.divisions.addDocument({
        id: "div-1",
        name: "Division 1",
        icon: "business",
        createdBy: "user-1",
    }, "div-1");

    (useStore as jest.Mock<ReturnType<typeof useStore>>).mockReturnValue(store);
});

afterEach(async () => {
    store.dispose();
    await clearFirestoreData({ projectId });
});

afterAll(() => app.delete());

describe("DivisionDetailContainer", () => {
    it("should not render when there is no active division", () => {
        const {
            asFragment,
        } = render(
            <DivisionDetail />
        );

        expect(asFragment()).toMatchSnapshot();
    });

    it("should display data of active division", async () => {
        await waitFor(() => expect(store.divisions.collection.isFetched).toBe(true));
        await store.divisions.setActiveDocumentId("div-1");

        const {
            getByText,
            container,
            unmount,
        } = render(
            <DivisionDetail />
        );

        await waitFor(() => getByText("business"));

        expect(
            container.querySelector<HTMLInputElement>(".division-detail__name input")?.value
        ).toBe("Division 1");

        unmount();
    });

    it("should update name of active document when name is changed", async () => {
        await waitFor(() => expect(store.divisions.collection.isFetched).toBe(true));
        await store.divisions.setActiveDocumentId("div-1");

        const {
            container,
            getByText,
            unmount,
        } = render(
            <DivisionDetail />
        );

        await waitFor(() => getByText("Name"));

        act(() => {
            fireEvent.change(container.querySelectorAll("input")[0], {
                target: {
                    value: "Division 2",
                },
            });
        });

        expect(store.divisions.activeDocument!.name).toBe("Division 2");

        unmount();
    });
});