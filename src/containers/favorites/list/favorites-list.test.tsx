import React from "react";
import { initTestFirestore, deleteFirebaseAppsAsync } from "../../../__tests__/utils/firebase";
import { FavoritesList } from ".";
import { FavoriteCollection } from "../../../__tests__/utils/firestorable/favorite-collection";
import { UserCollection } from "../../../__tests__/utils/firestorable/user-collection";
import { TestCollection } from "../../../__tests__/utils/firestorable/collection";
import { IClientData, IFavoriteRegistrationGroup, IProjectData, ITaskData } from "../../../../common";
import { StoreContext } from "../../../contexts/store-context";
import { IRootStore } from "../../../stores/root-store";
import { render, waitFor } from "@testing-library/react";
import { FavoriteStore } from "../../../stores/favorite-store";
import { UserStore } from "../../../stores/user-store";
import { ConfigStore } from "../../../stores/config-store";
import { ProjectStore } from "../../../stores/project-store";

const {
    firestore,
    refs: [
        favoritesRef,
        userRef,
        clientRef,
        favoriteGroupRef,
        projectRef,
        taskRef,
    ],
    clearFirestoreDataAsync
} = initTestFirestore("favorite-list-test",
    [
        "favorites",
        "users",
        "clients",
        "favorite-groups",
        "projects",
        "tasks",
    ]);

beforeEach(() => clearFirestoreDataAsync());

afterAll(() => deleteFirebaseAppsAsync());

class TestStore {
    rootStore = this as unknown as IRootStore;
    public user = new UserStore(this.rootStore, {
        firestore,
    });
    public favorites = new FavoriteStore(this.rootStore, {
        firestore,
    });

    public config = new ConfigStore(this.rootStore, {
        firestore,
    });

    public timesheets = {
        registration: undefined,
    }

    public projects = new ProjectStore(this.rootStore, {
        firestore,
    });

    public getOrganisationId = () => undefined;
}

describe("FavoritesList", () => {

    it("should render without favorites", () => {
        const store = new TestStore() as unknown as IRootStore;

        const { asFragment } = render(
            <StoreContext.Provider value={store}>
                <FavoritesList />
            </StoreContext.Provider>
        );

        expect(asFragment()).toMatchSnapshot();
    });

    it("should render favorites", async () => {
        const setupAsync = () => {
            const favoriteCollection = new FavoriteCollection(firestore, favoritesRef);
            const userCollection = new UserCollection(firestore, userRef);
            const clientCollection = new TestCollection<IClientData>(firestore, clientRef);
            const favoriteGroupCollection = new TestCollection<IFavoriteRegistrationGroup>(firestore, favoriteGroupRef);
            const projectCollection = new TestCollection<IProjectData>(firestore, projectRef);
            const taskCollection = new TestCollection<ITaskData>(firestore, taskRef);

            return Promise.all([
                // favorites
                favoriteCollection.addAsync([
                    {
                        groupId: "group-1",
                        userId: "user-1",
                        description: "Favorite desc 1",
                        client: "client-1",
                        time: 3,
                    },
                    {
                        groupId: "group-1",
                        userId: "user-1",
                        description: "Favorite desc 2",
                        task: "task-1",
                        time: 2,
                    },
                    {
                        groupId: "group-1",
                        userId: "user-1",
                        description: "Favorite desc 3",
                        task: "task-1",
                        project: "project-1",
                        time: 2,
                    },
                ]),
                userCollection.addAsync(
                    {
                        name: "user 1",
                        uid: "user-1",
                    },
                    "user-1",
                ),
                clientCollection.addAsync(
                    {
                        name_insensitive: "CLIENT 1",
                        name: "client 1",
                    },
                    "client-1",
                ),
                favoriteGroupCollection.addAsync(
                    {
                        name: "group 1",
                        userId: "user-1",
                    },
                    "group-1",
                ),
                projectCollection.addAsync(
                    {
                        name: "project 1",
                    },
                    "project-1",
                ),
                taskCollection.addAsync(
                    {
                        name: "task 1",
                    },
                    "task-1",
                ),
            ]);
        };

        await setupAsync();

        let store: IRootStore;

        store = new TestStore() as unknown as IRootStore;
        store.user.setUser({
            uid: "user-1",
            displayName: "user 1",
        } as firebase.User);

        store.favorites.setActiveFavoriteGroupId("group-1");


        const { getByText, asFragment } = render(
            // <FirebaseProvider>
            <StoreContext.Provider value={store}>
                <FavoritesList />
            </StoreContext.Provider>
            //</FirebaseProvider>
        );

        // FavoritesList will fetch favorites by groupId once it get's rendered
        // so we have to wait here for those favorites to be fetched and rendered
        await waitFor(
            () => expect(getByText("Favorite desc 2")),
        );

        expect(asFragment()).toMatchSnapshot();
    });
});