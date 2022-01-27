import React from "react";
import path from "path";
import fs from "fs";

import { SettingsPage } from "./settings-page";
import { render } from "@testing-library/react";
import { initializeTestEnvironment, RulesTestEnvironment,  } from "@firebase/rules-unit-testing";
import { IRootStore, Store } from "../../stores/root-store";
import { useStore } from "../../contexts/store-context";
import { User } from "firebase/auth";

jest.mock("../../contexts/store-context");

let testEnv: RulesTestEnvironment;

let store: IRootStore;
beforeAll(async () => {
    const projectId = "settings-page";
    testEnv = await initializeTestEnvironment({
        projectId,
        firestore: {
            rules: fs.readFileSync(path.resolve(__dirname, "../../../firestore.rules.test"), "utf8"),
        }
    });
});

beforeEach(async () => {
    store = new Store({
        firestore: testEnv.unauthenticatedContext().firestore() as any,
    });

    await store.auth.addDocument({
        uid: "user-1",
        divisionId: "",
        name: "User 1",
        recentProjects: [],
        roles: { user: true },
        tasks: new Map(),
        email: "user@timesheets.com",
        githubRepos: [],
    }, "user-1");

    store.auth.setUser({
        uid: "user-1",
    } as User);

    (useStore as jest.Mock<ReturnType<typeof useStore>>).mockReturnValue(store);
});

afterEach(async () => {
    store.dispose();
    await testEnv.unauthenticatedContext();
});

afterAll(() => testEnv.cleanup());

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
