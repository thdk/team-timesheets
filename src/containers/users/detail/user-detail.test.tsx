import React from "react";

import { initTestFirestore, deleteFirebaseAppsAsync } from "../../../__tests__/utils/firebase";
import { Store } from "../../../stores/root-store";
import { UserDetail } from "./user-detail";
import { render, waitFor } from "@testing-library/react";
import { TestCollection } from "../../../__tests__/utils/firestorable/collection";
import { IUser, IUserData } from "../../../../common";
import { convertUser } from "../../../../common/serialization/serializer";

const {
    firestore,
    clearFirestoreDataAsync,
    refs: [
        userRef,
    ]
} = initTestFirestore("user-detail-test",
    [
        "users",
        "teams",
    ]);

const store = new Store({
    firestore,
});

jest.mock("../../../contexts/store-context", () => ({
    useStore: () => store,
}));

jest.mock("../../../rules");

beforeAll(clearFirestoreDataAsync);
afterAll(() => {
    store.dispose();
    return Promise.all([
        deleteFirebaseAppsAsync(),
    ])
});


describe("UserDetail", () => {
    it("should not render when there is no selected user", () => {
        const { asFragment } = render(<UserDetail />);

        expect(asFragment()).toMatchSnapshot();
    });

    describe("when there is a selected user", () => {
        const usercollection = new TestCollection<IUser, IUserData>(
            firestore,
            userRef,
            {
                serialize: convertUser,
                defaultSetOptions: {
                    merge: true,
                },
            },
        );
        beforeAll(async () => {
            await Promise.all([
                usercollection.addAsync(
                    {
                        name: "User 1",
                        roles: {
                            admin: true,
                        },
                        recentProjects: [],
                        tasks: new Map(),
                        uid: "user-1",
                    },
                    "user-1",
                ),
            ]);

            store.user.setSelectedUserId("user-1");
        });

        test("it should display user properties", async () => {
            await waitFor(() => expect(store.user.selectedUser).toBeDefined());

            const { container } = render(<UserDetail />);

            expect(container.querySelector("input[value='User 1']")).not.toBeNull();
        });

        // test("it should update user properties", async () => {
        //     const teamIds = await store.config.teamsCollection.addAsync([
        //         {
        //             name: "Team 1",
        //         },
        //         {
        //             name: "Team 2",
        //         },
        //         {
        //             name: "Team 3",
        //         },
        //     ]);

        //     await waitFor(() => expect(store.user.selectedUser).toBeDefined());

        //     const { container } = render(<UserDetail />);

        //     const userNameTextEl = container.querySelector<HTMLInputElement>("input[value='User 1']");
        //     expect(userNameTextEl).not.toBeNull();

        //     userEvent.clear(userNameTextEl!);
        //     userEvent.type(userNameTextEl!, "User 2");

        //     await waitFor(() => expect(userNameTextEl!.value).toBe("User 2"));

        //     const adminSwitchEl = container.querySelector("#toggle--admin");
        //     expect(adminSwitchEl).not.toBeNull();

        //     await waitFor(() => expect(adminSwitchEl?.attributes.getNamedItem("aria-checked")?.value).toBe("true"));

        //     userEvent.click(adminSwitchEl!);

        //     await waitFor(() => expect(adminSwitchEl?.attributes.getNamedItem("aria-checked")?.value).toBe("false"));

        //     const teamSelectEl = container.querySelector<HTMLSelectElement>("#teams-collection");

        //     userEvent.selectOptions(teamSelectEl!, teamIds[1]);

        //     await waitFor(
        //         () => expect(
        //             container.querySelector<HTMLOptionElement>(`option[value=${teamIds[1]}]`)!.selected
        //         ).toBe(true)
        //     );

        //     await waitFor(
        //         () => expect(
        //             store.user.selectedUser?.team
        //         ).toBe(teamIds[1])
        //     );
        // });
    });
});
