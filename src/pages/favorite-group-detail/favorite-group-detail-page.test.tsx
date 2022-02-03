import React from "react";
import fs from "fs";
import path from "path";

import { useStore } from "../../contexts/store-context";


import { Store } from "../../stores/root-store";
import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import { FavoriteGroupPage } from "./favorite-group-detail-page";
import { useRouterStore } from "../../stores/router-store";
import routes from "../../routes/favorites/detail";
import userEvent from "@testing-library/user-event";
import { RulesTestEnvironment, initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { User } from "firebase/auth";
import { App, goToFavorites } from "../../internal";

jest.mock("../../routes/favorites/list.tsx");
jest.mock("../../contexts/store-context");
jest.mock('../../contexts/project-context');
jest.mock("../../stores/router-store", () => ({
    useRouterStore: jest.fn(),
}));

const projectId = "favorite-group-detail-page";

let store: Store;
const userId = "user-1";
let favoriteGroupIds: string[] = ["fav-1", "fav-2", "fav-3"];

const setupAsync = async () => {
    store = new Store({
        firestore,
    });

    await store.auth.addDocument({
        uid: userId,
        divisionId: "",
        name: "User 1",
        recentProjects: [],
        roles: { user: true },
        tasks: new Map(),
        email: "user@timesheets.com",
        githubRepos: [],
    }, userId);


    await Promise.all(
        [
            store.favorites.addDocument(
                {
                    name: "fav 1",
                    userId: userId,
                },
                "fav-1",
            ),
            store.favorites.addDocument(
                {
                    name: "fav 2",
                    userId: userId,
                },
                "fav-2",
            ),
            store.favorites.addDocument(
                {
                    name: "fav 3",
                    userId: userId,
                },
                "fav-3",
            ),
        ]);

    await store.favorites.favoriteCollection.addAsync(
        {
            groupId: favoriteGroupIds[1],
            userId,
            description: "fav reg 1",
            time: 3,
        });

    await store.favorites.favoriteCollection.addAsync({
        groupId: favoriteGroupIds[1],
        userId,
        description: "fav reg 2",
        time: 1,
    });

    store.auth.setUser({
        uid: userId,
    } as User);

    await waitFor(() => expect(store.auth.activeDocument).toBeTruthy());
};

let testEnv: RulesTestEnvironment;
let firestore: any;

beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
        projectId,
        firestore: {
            rules: fs.readFileSync(path.resolve(__dirname, "../../../firestore.rules.test"), "utf8"),
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
    jest.clearAllMocks();
    await testEnv.clearFirestore();
});

afterAll(() => testEnv.cleanup());
describe("favoriteGroupDetailPage", () => {
    const goToFavoritesMock = jest.fn();

    beforeEach(() => {
        (goToFavorites as jest.Mock<ReturnType<typeof goToFavorites>>).mockImplementationOnce(goToFavoritesMock);
    })

    describe("when an favorite group id is requested from the url", () => {
        it(
            "should render the details for the favorite group",
            async () => {
                (useRouterStore as jest.Mock<Partial<ReturnType<typeof useRouterStore>>>).mockReturnValue({
                    params: {
                        id: favoriteGroupIds[1],
                    },
                    currentRoute: routes.favoriteDetail,
                });

                const {
                    container,
                    getByText,
                } = render(
                    <FavoriteGroupPage />
                );

                await waitFor(() => {
                    expect(container.querySelector("input[value='fav 2']")).not.toBeNull();
                    expect(getByText("fav reg 1"));
                    expect(getByText("fav reg 2"));
                });
            },
        );

        it(
            "should allow to edit the favorite group name",
            async () => {
                (useRouterStore as jest.Mock<Partial<ReturnType<typeof useRouterStore>>>).mockReturnValue({
                    ...jest.requireActual("../../stores/router-store").useRouterStore(),
                    params: {
                        id: favoriteGroupIds[1],
                    },
                    currentRoute: routes.favoriteDetail,
                });

                const {
                    container,
                } = render(
                    <App>
                        <FavoriteGroupPage />
                    </App>
                );

                let nameInputEl;
                await waitFor(() => {
                    nameInputEl = container.querySelector("input[value='fav 2']");
                    expect(nameInputEl).not.toBeNull();
                    expect(store.favorites.groups).toHaveLength(3);
                });

                if (nameInputEl)
                    await userEvent.type(nameInputEl, "fav 3");

                screen.getByText("save").click();

                await waitFor(() => {
                    expect(goToFavoritesMock).toHaveBeenCalled();
                });
            },
        );

        it(
            "should allow to overwrite an existing favorite group",
            async () => {
                (useRouterStore as jest.Mock<Partial<ReturnType<typeof useRouterStore>>>).mockReturnValue({
                    ...jest.requireActual("../../stores/router-store").useRouterStore(),
                    params: {
                        id: favoriteGroupIds[0],
                    },
                    currentRoute: routes.favoriteDetail,
                    
                });

                const {
                    container,
                    getByText,
                } = render(
                    <App>
                        <FavoriteGroupPage />
                    </App>
                );

                await waitFor(() => {
                    expect(store.favorites.activeDocumentId).toBeTruthy();
                });
                await waitFor(() => {
                    expect(store.favorites.activeDocument).toBeTruthy();
                })
                await waitFor(() => {
                    const nameInputEl = container.querySelector("input[value='fav 1']");
                    expect(nameInputEl).not.toBeNull();
                    expect(store.favorites.groups).toHaveLength(3);
                });

                let checkboxLabelEl;
                await waitFor(() => {
                    checkboxLabelEl = getByText("Overwrite existing");
                    expect(checkboxLabelEl).not.toBeNull();
                });

                if (checkboxLabelEl)
                    await userEvent.click(checkboxLabelEl);

                let dropDownEl;
                await waitFor(() => {
                    dropDownEl = container.querySelector("select");
                    expect(dropDownEl).not.toBeNull();
                });

                if (dropDownEl) {
                    fireEvent.change(dropDownEl, {
                        target: { value: favoriteGroupIds[2] },
                        currentTarget: { value: favoriteGroupIds[2] },
                    });
                }

                await waitFor(() => expect(store.favorites.setActiveDocumentId).toBeTruthy());
                screen.getByText("save").click();

                await waitFor(() => expect(store.favorites.groups.length).toBe(2));

                await waitFor(() => {
                    expect(goToFavoritesMock).toHaveBeenCalled();
                })
            },
        );
    });
});
