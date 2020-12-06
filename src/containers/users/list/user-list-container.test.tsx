import fs from "fs";
import path from "path";

import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react";

import { StoreContext } from "../../../contexts/store-context";
import { Store } from "../../../stores/root-store";
import { UserList } from ".";

import type firebase from "firebase";
import { loadFirestoreRules, initializeTestApp, clearFirestoreData, } from "@firebase/rules-unit-testing";

const projectId = "user-list-container-test";
const app = initializeTestApp({
    projectId,
});

let store: Store;

const setupAsync = () => {
    store = new Store({
        firestore: app.firestore(),
    });

    return Promise.all([
        store.user.usersCollection.addAsync(
            {
                name: "user 1",
                team: "team-1",
                roles: {
                    user: true,
                },
                uid: "user-1",
                divisionId: "",
                recentProjects: [],
                tasks: new Map(),
            },
            "user-1",
        ),
        store.user.usersCollection.addAsync(
            {
                name: "user 2",
                team: "team-0",
                roles: {
                    user: true,
                },
                uid: "user-2",
                divisionId: "",
                recentProjects: [],
                tasks: new Map(),
            },
            "user-2",
        ),
        store.user.usersCollection.addAsync(
            {
                name: "user 3",
                roles: {
                    user: true,
                },
                uid: "user-3",
                divisionId: "",
                recentProjects: [],
                tasks: new Map(),
            },
            "user-3",
        ),
        store.user.usersCollection.addAsync(
            {
                name: "admin 1",
                team: "team-1",
                roles: {
                    admin: true,
                    user: true,
                },
                uid: "admin-1",
                divisionId: "",
                recentProjects: [],
                tasks: new Map(),
            },
            "admin-1",
        ),
        store.config.teamsCollection.addAsync(
            {
                name: "team 1",
                divisionId: "",
            },
            "team-1",
        ),
    ]);
};

beforeAll(async () => {
    await loadFirestoreRules({
        projectId,
        rules: fs.readFileSync(path.resolve(__dirname, "../../../../firestore.rules.test"), "utf8"),
    })
})

beforeEach(() => setupAsync());

afterEach(async () => {
    store.dispose();
    await clearFirestoreData({
        projectId,
    });
});

afterAll(() => app.delete());


describe("UserListContainer", () => {

    it("should render without users", () => {

        const { asFragment, unmount, } = render(
            <StoreContext.Provider value={store}>
                <UserList />
            </StoreContext.Provider>
        );

        expect(asFragment()).toMatchSnapshot();

        unmount();
    });

    describe("when logged in user is admin", () => {

        beforeEach(() => {
            store.auth.setUser({
                uid: "admin-1",
                displayName: "admin 1",
            } as firebase.User);

            return waitFor(() => !!store.auth.activeDocument?.roles?.admin);
        });

        it("should render users", async () => {
            const { getByText, asFragment, unmount, } = render(
                <StoreContext.Provider value={store}>
                    <UserList />
                </StoreContext.Provider>
            );

            await waitFor(
                () => expect(getByText("team 1 - Admin, user")),
            );

            expect(asFragment()).toMatchSnapshot();

            unmount();
        });

        it("should navigate to user detail when item is clicked", async () => {
            const goTo = jest.fn();
            store.router.goTo = goTo;

            const { findByText, unmount, } = render(
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

            unmount();
        });

        // describe("when user is added in the collection", () => {
        //     it("should rerender to add the user to the list", async () => {
        //         const { queryByText, getByText } = render(
        //             <StoreContext.Provider value={store}>
        //                 <UserList />
        //             </StoreContext.Provider>
        //         );

        //         // user should originally not be in the list
        //         expect(queryByText("user b")).toBeNull();

        //         // add user in database
        //         const userId = await userCollection.addAsync({
        //             name: "user b",
        //             roles: {
        //                 user: true,
        //             },
        //         });

        //         // list should be updated with new user
        //         await waitFor(() => expect(getByText("user b")));

        //         // clean up the database by removing the user again
        //         await userCollection.deleteAsync(userId);

        //         // user should originally not be in the list
        //         await waitFor(() => expect(queryByText("user b")).toBeNull());
        //     });
        // });

        // describe("when user is removed from the collection", () => {
        //     const userId = "user-b";
        //     beforeEach(() => userCollection.addAsync({
        //         name: "user b",
        //         roles: {
        //             user: true,
        //         },
        //         uid: userId,
        //     }, userId));

        //     it("should rerender to removed the user from the list", async () => {
        //         const { getByText, queryByText } = render(
        //             <StoreContext.Provider value={store}>
        //                 <UserList />
        //             </StoreContext.Provider>
        //         );

        //         // user should originally be in the list
        //         await waitFor(() => expect(getByText("user b")));

        //         // delete user in database
        //         await userCollection.deleteAsync(userId);

        //         // list should be updated to remove the user
        //         await waitFor(() => expect(queryByText("user b")).toBeNull());
        //     });
        // });

        // describe("when user is updated in the collection", () => {
        //     it("should rerender to show the updated user in the list", async () => {
        //         const { getByText } = render(
        //             <StoreContext.Provider value={store}>
        //                 <UserList />
        //             </StoreContext.Provider>
        //         );

        //         // user should originally be in the list
        //         expect(getByText("user 1"));

        //         // update user in database
        //         await userCollection.updateAsync({
        //             name: "user 1 b",
        //         }, "user-1");

        //         // list should be updated with new user name
        //         await waitFor(() => expect(getByText("user 1 b")));

        //         // clean up the database by changing user name again
        //         await userCollection.updateAsync({ name: "user 1" }, "user-1");
        //     });
        // });
    });
});
