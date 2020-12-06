import React from "react";
import fs from "fs";
import path from "path";

import { Store } from "../../../stores/root-store";
import { UserDetail } from "./user-detail";
import { render, waitFor } from "@testing-library/react";
import { initializeTestApp, loadFirestoreRules, clearFirestoreData } from "@firebase/rules-unit-testing";
import { useStore } from "../../../contexts/store-context";

jest.mock("../../../contexts/store-context");
jest.mock("../../../rules");

const projectId = "user-detail-test";
const app = initializeTestApp({
    projectId,
});

let store: Store;
const setupAsync = async () => {
    store = new Store({
        firestore: app.firestore(),
    });

    await Promise.all([
        store.user.usersCollection.addAsync(
            {
                name: "User 1",
                roles: {
                    admin: true,
                },
                recentProjects: [],
                tasks: new Map(),
                uid: "user-1",
                divisionId: "",
            },
            "user-1",
        ),
    ]);
};

beforeAll(async () => {
    await loadFirestoreRules({
        projectId,
        rules: fs.readFileSync(path.resolve(__dirname, "../../../../", "firestore.rules.test"), "utf8"),
    });
})

beforeEach(async () => {
   await setupAsync();

   (useStore as jest.Mock<ReturnType<typeof useStore>>).mockReturnValue(store);
})

afterEach(async () => {
    store.dispose();
    await clearFirestoreData({
        projectId,
    });
});

afterAll(() => app.delete());


describe("UserDetail", () => {
    it("should not render when there is no selected user", () => {
        const { asFragment } = render(<UserDetail />);

        expect(asFragment()).toMatchSnapshot();
    });

    describe("when there is a selected user", () => {
        beforeEach(() =>
            store.user.setSelectedUserId("user-1"),
        );

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
