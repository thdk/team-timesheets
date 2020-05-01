import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react";

import { initTestFirestore, deleteFirebaseAppsAsync } from "../../../__tests__/utils/firebase";

import { TestCollection } from "../../../__tests__/utils/firestorable/collection";

import { StoreProvider } from "../../../contexts/store-context";
import { IRootStore } from "../../../stores/root-store";
import { UserStore } from "../../../stores/user-store";
import { ConfigStore } from "../../../stores/config-store";
import { UserList } from "./";
import { ITeamData } from "../../../../common";
import { RouterStore } from "mobx-router";
import { ViewStore } from "../../../stores/view-store";

jest.mock("@material/top-app-bar/index", () => ({
    MDCTopAppBar: () => <></>,
}));

jest.mock("@material/icon-button/index", () => ({
    MDCIconButtonToggle: () => <></>,
}));

jest.mock("@material/tab-bar/index", () => ({
    MDCTabBar: () => <></>,
}));

jest.mock("@material/ripple/index", () => ({
    MDCRipple: () => <></>,
}));

jest.mock("@material/switch/index", () => ({
    MDCSwitch: () => <></>,
}));

const {
    firestore,
    refs: [
        userRef,
        teamRef,
    ],
    //clearFirestoreDataAsync
} = initTestFirestore("user-list-test",
    [
        "users",
        "teams",
    ]);

afterAll(() => deleteFirebaseAppsAsync());

class TestStore {
    rootStore = this as unknown as IRootStore;
    public user = new UserStore(this.rootStore, {
        firestore,
    });

    public config = new ConfigStore(this.rootStore, {
        firestore,
    });

    public view = new ViewStore(this.rootStore);

    public router = new RouterStore(this.rootStore);
}

const setupAsync = () => {
    const userCollection = new TestCollection(firestore, userRef);
    const teamCollection = new TestCollection<ITeamData>(firestore, teamRef);

    return Promise.all([
        userCollection.addAsync(
            {
                name: "user 1",
                team: "team-1",
                roles: {
                    user: true,
                }
            },
            "user-1",
        ),
        userCollection.addAsync(
            {
                name: "user 2",
                team: "team-0",
                roles: {
                    user: true,
                }
            },
            "user-2",
        ),
        userCollection.addAsync(
            {
                name: "user 3",
                roles: {
                    user: true,
                }
            },
            "user-3",
        ),
        userCollection.addAsync(
            {
                name: "admin 1",
                team: "team-1",
                roles: {
                    admin: true,
                    user: true,
                }
            },
            "admin-1",
        ),
        teamCollection.addAsync(
            {
                name_insensitive: "TEAM 1",
                name: "team 1",
            },
            "team-1",
        ),
    ]);
};

beforeAll(() => setupAsync());

describe("UserListContainer", () => {

    const store = new TestStore() as unknown as IRootStore;

    it("should render without users", () => {

        const { asFragment } = render(
            <StoreProvider value={store}>
                <UserList />
            </StoreProvider>
        );

        expect(asFragment()).toMatchSnapshot();
    });

    describe("when logged in user is admin", () => {

        beforeAll(() => {
            store.user.setUser({
                uid: "admin-1",
                displayName: "admin 1",
            } as firebase.User);

            return waitFor(() => store.user.isAuthInitialised);
        });

        it("should render users", async () => {
            const { findByText, asFragment } = render(
                <StoreProvider value={store}>
                    <UserList />
                </StoreProvider>
            );

            await waitFor(
                () => findByText("user 1"),
            );

            expect(asFragment()).toMatchSnapshot();
        });

        it("should navigate to user detail when item is clicked", async () => {
            const goTo = jest.fn();
            store.router.goTo = goTo;

            const { findByText } = render(
                <StoreProvider value={store}>
                    <UserList />
                </StoreProvider>
            );

            const userListItemEl = await findByText("user 1");

            expect(goTo).not.toHaveBeenCalled();

            fireEvent.click(userListItemEl);

            expect(goTo).toHaveBeenCalledWith(
                expect.objectContaining({
                    path: "/user/:id"
                }),
                {
                    id: "user-1"
                },
            );
        });
    });
});
