import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react";

import { initTestFirestore, deleteFirebaseAppsAsync } from "../../../__tests__/utils/firebase";

import { TestCollection } from "../../../__tests__/utils/firestorable/collection";

import { StoreContext } from "../../../contexts/store-context";
import { Store } from "../../../stores/root-store";
import { ITeamData } from "../../../../common";
import { UserList } from ".";

jest.mock("@material/top-app-bar/index", () => ({
    MDCTopAppBar: () => <></>,
}));

jest.mock("@material/icon-button/index", () => ({
    MDCIconButtonToggle: () => <></>,
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
    clearFirestoreDataAsync
} = initTestFirestore("user-list-test",
    [
        "users",
        "teams",
    ]);

beforeAll(clearFirestoreDataAsync);
afterAll(() => deleteFirebaseAppsAsync());

const userCollection = new TestCollection(firestore, userRef);
const teamCollection = new TestCollection<ITeamData>(firestore, teamRef);

const setupAsync = () => {

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

    const store = new Store({ firestore });

    it("should render without users", () => {

        const { asFragment } = render(
            <StoreContext.Provider value={store}>
                <UserList />
            </StoreContext.Provider>
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
                <StoreContext.Provider value={store}>
                    <UserList />
                </StoreContext.Provider>
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
                <StoreContext.Provider value={store}>
                    <UserList />
                </StoreContext.Provider>
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

        describe("when user is added in the collection", () => {
            it("should rerender to add the user to the list", async () => {
                const { queryByText, getByText } = render(
                    <StoreContext.Provider value={store}>
                        <UserList />
                    </StoreContext.Provider>
                );

                // user should originally not be in the list
                expect(queryByText("user b")).toBeNull();

                // add user in database
                const userId = await userCollection.addAsync({
                    name: "user b",
                    roles: {
                        user: true,
                    },
                });

                // list should be updated with new user
                await waitFor(() => expect(getByText("user b")));

                // clean up the database by removing the user again
                await userCollection.deleteAsync(userId);
            });
        });

        describe("when user is removed from the collection", () => {
            let userId: string;
            beforeEach(() => userCollection.addAsync({
                name: "user b",
                roles: {
                    user: true,
                },
            }).then((id) => userId = id));

            it("should rerender to removed the user from the list", async () => {
                const { getByText, queryByText } = render(
                    <StoreContext.Provider value={store}>
                        <UserList />
                    </StoreContext.Provider>
                );

                // user should originally be in the list
                expect(getByText("user b")).not.toBeNull();

                // delete user in database
                await userCollection.deleteAsync(userId);

                // list should be updated to remove the user
                await waitFor(() => expect(queryByText("user b")).toBeNull());
            });
        });

        describe("when user is updated in the collection", () => {
            it("should rerender to show the updated user in the list", async () => {
                const { getByText } = render(
                    <StoreContext.Provider value={store}>
                        <UserList />
                    </StoreContext.Provider>
                );

                // user should originally be in the list
                expect(getByText("user 1"));

                // update user in database
                await userCollection.updateAsync({
                    name: "user 1 b",
                }, "user-1");

                // list should be updated with new user name
                await waitFor(() => expect(getByText("user 1 b")));

                // clean up the database by changing user name again
                await userCollection.updateAsync({ name: "user 1" }, "user-1");
            });
        });
    });
});
