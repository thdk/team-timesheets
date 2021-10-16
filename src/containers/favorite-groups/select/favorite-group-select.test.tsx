import React from "react";
import fs from "fs";
import path from "path";

import { render, waitFor } from "@testing-library/react";
import { Store } from "../../../stores/root-store";
import { useStore } from "../../../contexts/store-context";
import userEvent from "@testing-library/user-event";
import { FavoriteGroupSelect } from "./favorite-group-select";
import { RulesTestEnvironment, initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { User } from "firebase/auth";

jest.mock("../../../contexts/store-context");

const projectId = "project-select-test";

let testEnv: RulesTestEnvironment;
let firestore: any;

beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
        projectId,
        firestore: {
            rules: fs.readFileSync(path.resolve(__dirname, "../../../../firestore.rules.test"), "utf8"),
        }
    });

    firestore = testEnv.unauthenticatedContext().firestore();
});

const userId = "user-1";
let store: Store;
beforeEach(async () => {
    store = new Store({
        firestore,
    });

    await Promise.all([
        store.user.usersCollection.addAsync(
            {
                name: "user 1",
                team: "team-1",
                roles: {
                    user: true,
                },
                uid: userId,
                tasks: new Map(),
                recentProjects: [],
                divisionId: "",
            },
            userId,
        ),
    ]);

    store.auth.setUser({
        uid: "user-1",
    } as User);

    (useStore as jest.Mock<ReturnType<typeof useStore>>).mockReturnValue(store);
});

afterEach(async () => {
    store.dispose();
    await testEnv.clearFirestore();
});

afterAll(() => testEnv.cleanup());

describe("FavoriteGroupSelect", () => {
    it("should render without favorite groups", () => {
        const {
            asFragment,
        } = render(
            <FavoriteGroupSelect
                onChange={jest.fn()}
                value={undefined}
            />
        );

        expect(asFragment()).toMatchSnapshot();
    });

    describe("when there are favorite groups", () => {
        let groupIds: string[];
        beforeEach(async () => {
            groupIds = await Promise.all([
                store.favorites.addDocument(
                    {
                        name: "favorite group 1",
                        userId,
                    },
                ),
                store.favorites.addDocument(
                    {
                        name: "favorite group 2",
                        userId,
                    },
                ),
                store.favorites.addDocument(
                    {
                        name: "favorite group 3",
                        userId,
                    },
                ),
            ]);
        });

        it("should show an option for each favorite group", async () => {
            const {
                getByText,
                unmount,
            } = render(
                <FavoriteGroupSelect
                    onChange={jest.fn()}
                    value={undefined}
                />
            );

            await waitFor(() => getByText("favorite group 1"));
            await waitFor(() => getByText("favorite group 2"));
            await waitFor(() => getByText("favorite group 3"));

            unmount();
        });

        it("should call onChange when favorite group is selected", async () => {
            const onChange = jest.fn();
            const {
                container,
                getByText,
                unmount,
            } = render(
                <FavoriteGroupSelect
                    value={undefined}
                    onChange={onChange}
                />
            );

            await waitFor(() => getByText("favorite group 3"));

            userEvent.selectOptions(container.querySelector("select")!, [groupIds[2]]);

            expect(onChange).toBeCalledWith(groupIds[2]);

            unmount();
        });

        it("should select the given favorite group", async () => {
            const {
                container,
                unmount,
            } = render(
                <FavoriteGroupSelect
                    value={groupIds[2]}
                    onChange={jest.fn()}
                />
            );

            await waitFor(
                () => expect(
                    container.querySelector("select")?.value
                ).toBe(groupIds[2]),
            );

            unmount();
        });
    });
});
