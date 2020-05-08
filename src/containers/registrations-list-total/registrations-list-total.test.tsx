import React from "react";
import { initTestFirestore, deleteFirebaseAppsAsync } from "../../__tests__/utils/firebase";
import { IRootStore } from "../../stores/root-store";
import { TestCollection } from "../../__tests__/utils/firestorable/collection";
import { IRegistrationData } from "../../../common";
import { waitFor, render } from "@testing-library/react";
import { RegistrationsListTotal } from "./registrations-list-total";
import { StoreProvider } from "../../contexts/store-context";
import { UserStore } from "../../stores/user-store";
import { ViewStore } from "../../stores/view-store";
import { ConfigStore } from "../../stores/config-store";
import { RegistrationStore } from "../../stores/registration-store";

export class TestStore {
    rootStore: IRootStore = this as unknown as IRootStore;

    public user = new UserStore(this.rootStore, { firestore });
    public view = new ViewStore(this.rootStore, new Date(2020, 3, 1));
    public config = new ConfigStore(this.rootStore, { firestore });
    public timesheets = new RegistrationStore(
        this.rootStore, { firestore }
    );

    public dispose() {
        this.user.dispose();
        this.timesheets.dispose();
        // this.config.dispose();
    }
}

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
    clearFirestoreDataAsync,
    refs: [
        registrationRef,
        userRef,
    ]
} = initTestFirestore("registrations-list-total-test",
    [
        "registrations",
        "users",
    ]);

const userCollection = new TestCollection(firestore, userRef);
const registrationCollection = new TestCollection<IRegistrationData>(firestore, registrationRef);

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
        registrationCollection.addAsync([
            {
                userId: "user-1",
                description: "desc 0",
                date: new Date(2020, 3, 1),
                time: 1,
                isPersisted: true,
                created: new Date(2020, 3, 1, 15, 50, 0),
            },
            {
                userId: "user-1",
                description: "desc 1",
                date: new Date(2020, 3, 4),
                time: 3,
                isPersisted: true,
                created: new Date(2020, 3, 4, 7, 50, 0),
            },
            {
                userId: "user-1",
                description: "desc 2",
                date: new Date(2020, 3, 4),
                time: 2.5,
                isPersisted: true,
                created: new Date(2020, 3, 4, 7, 51, 0),
            },
            {
                userId: "user-1",
                description: "desc 3",
                date: new Date(2020, 3, 7),
                time: 2.5,
                isPersisted: true,
            },
        ] as any as IRegistrationData[]),
        registrationCollection.addAsync(
            {
                userId: "user-1",
                description: "desc 3",
                date: new Date(2020, 3, 9),
                time: 4.50,
                isPersisted: true,
                created: new Date(2020, 3, 9, 17, 50, 0),
            } as any as IRegistrationData,
            "reg-1",
        ),
        registrationCollection.addAsync(
            {
                userId: "user-1",
                description: "desc 4",
                date: new Date(2020, 5, 9),
                time: 4.50,
                isPersisted: true,
                created: new Date(2020, 5, 9, 17, 50, 0),
            } as any as IRegistrationData,
            "reg-2",
        )
    ]);
};

const store = new TestStore();

beforeAll(clearFirestoreDataAsync);
beforeAll(setupAsync);
afterAll(() => {
    store.dispose();
    return Promise.all([
        deleteFirebaseAppsAsync(),
    ])
});

describe("RegistrationsListTotal", () => {
    beforeAll(() => {
        store.user.setUser({ uid: "user-1", displayName: "user 1" } as firebase.User);
    });

    it("should display total time", async () => {
        const { getByText } = render(
            <StoreProvider testStore={store as unknown as IRootStore}>
                <RegistrationsListTotal />
            </StoreProvider>
        );

        await waitFor(() => {
            expect(getByText("Total in April"));
            expect(getByText("13.5 hours"));
        });
    });
});
