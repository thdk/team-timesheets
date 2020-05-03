import { initTestFirestore, deleteFirebaseAppsAsync } from "../../__tests__/utils/firebase";
import { RegistrationStore } from "./registration-store";
import { IRootStore } from "../root-store";
import React from "react";
import { UserStore } from "../user-store";
import { TestCollection } from "../../__tests__/utils/firestorable/collection";
import { IRegistrationData } from "../../../common";
import firebase from "firebase/app";
import { ViewStore } from "../view-store";
import { waitFor } from "@testing-library/react";
import { reaction } from "mobx";
import { SortOrder } from "../../containers/registrations/days";
import { ConfigStore } from "../config-store";


jest.mock("@material/top-app-bar/index", () => ({
    MDCTopAppBar: () => React.Fragment,
}));

jest.mock("@material/icon-button/index", () => ({
    MDCIconButtonToggle: () => React.Fragment,
}));

jest.mock("@material/tab-bar/index", () => ({
    MDCTabBar: () => React.Fragment,
}));

jest.mock("@material/ripple/index", () => ({
    MDCRipple: () => React.Fragment,
}));

jest.mock("@material/switch/index", () => ({
    MDCSwitch: () => React.Fragment,
}));


const {
    firestore,
    clearFirestoreDataAsync,
    refs: [
        registrationRef,
        userRef,
    ]
} = initTestFirestore("registration-store-test",
    [
        "registrations",
        "users",
    ]);


class TestStore {
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
    // store.dispose();
    return Promise.all([
        deleteFirebaseAppsAsync(),
    ])
});

describe("RegistrationStore", () => {
    let unsubscribe: () => void;

    beforeAll(() => {
        store.user.setUser({ uid: "user-1", displayName: "user 1" } as firebase.User);
        unsubscribe = reaction(() => store.timesheets.registrationsGroupedByDay, () => { })
    });

    afterAll(() => unsubscribe());

    describe("registrationsGroupedByDay / registrationsGroupedByDayReversed", () => {

        describe("when there are registrations for the current user", () => {

            it("should return the registrations grouped by day", async () => {
                await waitFor(
                    () => expect(store.timesheets.registrationsGroupedByDay)
                        .toEqual(
                            expect.arrayContaining(
                                [
                                    expect.objectContaining({
                                        totalTime: 2.5,
                                        registrations: expect.arrayContaining([]),
                                    }),
                                    expect.objectContaining({
                                        totalTime: 5.5,
                                        registrations: expect.arrayContaining([]),
                                    }),
                                ]
                            )
                        )
                );
            });

            it("should return days in reversed chronological order", async () => {
                await waitFor(
                    () => {
                        expect(
                            Array.isArray(store.timesheets.registrationsGroupedByDayReversed)
                        ).toBe(true);

                        expect(store.timesheets.registrationsGroupedByDayReversed[0].groupKey)
                            .toBe("Thu Apr 09 2020");

                        expect(store.timesheets.registrationsGroupedByDayReversed[1].groupKey)
                            .toBe("Tue Apr 07 2020");

                        expect(store.timesheets.registrationsGroupedByDayReversed[2].groupKey)
                            .toBe("Sat Apr 04 2020");

                        expect(store.timesheets.registrationsGroupedByDayReversed[3].groupKey)
                            .toBe("Wed Apr 01 2020");
                    }
                );
            });

            it("should return days in chronological order", async () => {

                await waitFor(
                    () => {
                        expect(
                            Array.isArray(store.timesheets.registrationsGroupedByDay)
                        ).toBe(true);

                        expect(store.timesheets.registrationsGroupedByDay[0].groupKey)
                            .toBe("Wed Apr 01 2020");

                        expect(store.timesheets.registrationsGroupedByDay[1].groupKey)
                            .toBe("Sat Apr 04 2020");

                        expect(store.timesheets.registrationsGroupedByDay[2].groupKey)
                            .toBe("Tue Apr 07 2020");

                        expect(store.timesheets.registrationsGroupedByDay[3].groupKey)
                            .toBe("Thu Apr 09 2020");
                    }
                );

                store.timesheets.setRegistrationsGroupedByDaySortOrder(SortOrder.Descending);
            });

            it("should return no registrations when user logs out", async () => {
                await waitFor(() => {
                    expect(
                        store.timesheets.registrationsGroupedByDay.length
                    ).toBe(4);
                });

                store.user.setUser(null);

                await waitFor(() => {
                    expect(store.user.authenticatedUser).toBeFalsy();
                    expect(
                        store.timesheets.registrationsGroupedByDay.length
                    ).toBe(0);
                });

                store.user.setUser({ uid: "user-1", displayName: "user 1" } as firebase.User);
            });
        });

        describe("when there are no registrations for the current user", () => {

            beforeAll(() => store.user.setUser({ uid: "user-2", displayName: "user 2" } as firebase.User));
            afterAll(() => store.user.setUser({ uid: "user-1", displayName: "user 1" } as firebase.User));

            it("should return an empty list", async () => {
                await waitFor(
                    () => expect(store.timesheets.registrationsGroupedByDay.length)
                        .toBe(0)
                );
            });
        });
    });

    describe("areGroupedRegistrationsCollapsed", () => {

        let unsubscribe: () => void;

        beforeAll(() => {
            store.user.setUser({ uid: "user-1", displayName: "user 1" } as firebase.User);
            unsubscribe = reaction(() => store.timesheets.registrationsGroupedByDay, () => { })
        });

        afterAll(() => unsubscribe());

        describe("when set from false (default) to true", () => {
            it("should set isCollapsed property of all groups to 'true'", async () => {
                store.timesheets.areGroupedRegistrationsCollapsed = true;

                await waitFor(() =>
                    expect(store.timesheets.registrationsGroupedByDay
                        .some(g => !g.isCollapsed)
                    ).toBe(false)
                );

                store.timesheets.areGroupedRegistrationsCollapsed = false;
            });

            it("should clear selectedRegistrationDays", async () => {
                await waitFor(() =>
                    expect(store.timesheets.registrationsGroupedByDay
                        .some(g => g.isCollapsed)
                    ).toBe(false)
                );

                store.timesheets.areGroupedRegistrationsCollapsed = true;

                await waitFor(() =>
                    expect(store.timesheets.selectedRegistrationDays.length)
                        .toBe(0)
                );

                store.timesheets.areGroupedRegistrationsCollapsed = false;
            });
        });

        describe("when set from true to false", () => {
            beforeEach(() => {
                store.timesheets.areGroupedRegistrationsCollapsed = true;
            });

            it("should set isCollapsed property of all groups to 'false'", async () => {
                await waitFor(() =>
                    expect(store.timesheets.registrationsGroupedByDay
                        .some(g => !g.isCollapsed)
                    ).toBe(false)
                );

                store.timesheets.areGroupedRegistrationsCollapsed = false;

                await waitFor(() =>
                    expect(store.timesheets.registrationsGroupedByDay
                        .some(g => g.isCollapsed)
                    ).toBe(false)
                );
            });

            it("should set selectedRegistrationDays", async () => {
                await waitFor(() =>
                    expect(store.timesheets.registrationsGroupedByDay
                        .some(g => !g.isCollapsed)
                    ).toBe(false)
                );

                store.timesheets.areGroupedRegistrationsCollapsed = false;

                await waitFor(() =>
                    expect(store.timesheets.selectedRegistrationDays)
                        .toEqual(
                            expect.arrayContaining([
                                "Wed Apr 01 2020",
                                "Sat Apr 04 2020",
                                "Tue Apr 07 2020",
                                "Thu Apr 09 2020",
                            ])
                        )
                );
            });
        });
    });

    describe("registrationsTotalTime", () => {
        it("should return the total amount of time for the current filtered registrations", async () => {
            await waitFor(() => expect(
                store.timesheets.registrationsTotalTime
            ).toBe(13.5)
            );
        });
    });

    describe("setSelectedRegistration", () => {
        describe("when the requested registration id exists in the current filter", () => {
            it("should set selectedRegistration and selectedRegistrationId", () => {
                store.timesheets.setSelectedRegistration("reg-1");

                expect(store.timesheets.registrationId).toBe("reg-1");
                expect(store.timesheets.registration).toBeDefined();
                expect(store.timesheets.registration!.description).toBe("desc 3");

                store.timesheets.setSelectedRegistration(undefined);
            });
        });

        describe("when the requested registration id does not exist in the current filter", () => {
            it("should fetch the registration and set selectedRegistration and selectedRegistrationId", async () => {
                store.timesheets.setSelectedRegistration("reg-2");

                await waitFor(() => {
                    expect(store.timesheets.registrationId).toBe("reg-2");
                    expect(store.timesheets.registration).toBeDefined();
                    expect(store.timesheets.registration!.description).toBe("desc 4");
                });

                store.timesheets.setSelectedRegistration(undefined);
            });
        });
    });

    describe("saveSelectedRegistration", () => {
        it("should save changes to the selected registration", async () => {
            store.timesheets.setSelectedRegistration("reg-1");

            await waitFor(() => {
                expect(store.timesheets.registration).toBeDefined();
            })

            expect(store.timesheets.registrationId).toBe("reg-1");
            expect(store.timesheets.registration!.description).toBe("desc 3");

            store.timesheets.updateSelectedRegistration({
                description: "desc 3 a",
                project: "project-1",
            });

            expect(store.timesheets.registration!.description).toBe("desc 3 a");

            await store.timesheets.saveSelectedRegistration();

            await waitFor(async () => {
                const reg = await registrationCollection.getAsync("reg-1")
                    .then(doc => doc.data);

                expect(reg).toEqual(
                    expect.objectContaining({
                        description: "desc 3 a",
                        project: "project-1",
                    })
                )
            });

            store.timesheets.setSelectedRegistration(undefined);
        });
    });

    describe("toggleSelectedRegistrationDay", () => {
        store.timesheets.toggleSelectedRegistrationDay(
            "Sat Apr 04 2020"
        );

        expect(store.timesheets.selectedRegistrationDays)
            .toEqual(
                expect.arrayContaining([
                    "Sat Apr 04 2020",
                ])
            );

        store.timesheets.toggleSelectedRegistrationDay(
            "Sat Apr 04 2020",
            true,
        );

        expect(store.timesheets.selectedRegistrationDays)
            .toEqual(
                expect.arrayContaining([
                    "Sat Apr 04 2020",
                ])
            );

        store.timesheets.toggleSelectedRegistrationDay(
            "Sat Apr 04 2020"
        );

        expect(store.timesheets.selectedRegistrationDays)
            .toEqual([]);
    });
});
