import React from "react";
import path from "path";
import fs from "fs";

import { SettingsPage } from "./settings-page";
import { render } from "@testing-library/react";
import { initializeTestApp, loadFirestoreRules } from "@firebase/rules-unit-testing";
import { IRootStore, Store } from "../../stores/root-store";
import { clearFirestoreData } from "firestorable/lib/utils";
import { useStore } from "../../contexts/store-context";

import type firebase from "firebase";

jest.mock("../../contexts/store-context");

const projectId = "settings-page";
const app = initializeTestApp({
    projectId,
});

let store: IRootStore;
beforeAll(async () => {
    await loadFirestoreRules({
        projectId,
        rules: fs.readFileSync(path.resolve(__dirname, "../../../firestore.rules.test"), "utf8"),
    });
});

beforeEach(async () => {
    store = new Store({
        firestore: app.firestore(),
    });

    await store.auth.addDocument({
        uid: "user-1",
        divisionId: "",
        name: "User 1",
        recentProjects: [],
        roles: { user: true },
        tasks: new Map(),
        email: "user@timesheets.com",
    }, "user-1");

    store.auth.setUser({
        uid: "user-1",
    } as firebase.User);

    (useStore as jest.Mock<ReturnType<typeof useStore>>).mockReturnValue(store);
});

afterEach(async () => {
    store.dispose();
    await clearFirestoreData(projectId);
});

afterAll(() => app.delete());

jest.mock('../../containers/tasks/list', () => ({
    TaskList: () => <>Tasks-Content</>,
}));
jest.mock('../../containers/users/list', () => ({
    UserList: () => <>Users-Content</>,
}));
jest.mock('../../containers/clients/list', () => ({
    ClientList: () => <>Clients-Content</>,
}));
jest.mock('../../containers/teams/list', () => ({
    TeamList: () => <>Teams-Content</>,
}));

describe("SettingsPage", () => {

    it("should render", () => {
        const { asFragment } = render(
            <SettingsPage />
        );

        expect(asFragment()).toMatchSnapshot();
    });
});
