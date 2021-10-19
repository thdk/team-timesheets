import fs from "fs";
import path from "path";

import { IRegistration, IUser } from "../../../common";

import { waitFor } from "@testing-library/react";
import { reaction } from "mobx";
import { Store } from "../root-store";
import { RulesTestEnvironment, initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { User } from "firebase/auth";

const projectId = "registration-store-test";


let store: Store;
const setupAsync = async () => {
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
                email: "email@email.com",
                uid: "user-1",
            } as IUser,
            "user-1",
        ),
        store.timesheets.addDocument(
            {
                userId: "user-1",
                description: "desc 0",
                date: new Date(2020, 3, 1),
                time: 1,
                created: new Date(2020, 3, 1, 15, 50, 0),
            } as IRegistration),
        store.timesheets.addDocument({
            userId: "user-1",
            description: "desc 1",
            date: new Date(2020, 3, 4),
            time: 3,
            created: new Date(2020, 3, 4, 7, 50, 0),
        } as IRegistration),
        store.timesheets.addDocument({
            userId: "user-1",
            description: "desc 2",
            date: new Date(2020, 3, 4),
            time: 2.5,
            created: new Date(2020, 3, 4, 7, 51, 0),
        } as IRegistration),
        store.timesheets.addDocument({
            userId: "user-1",
            description: "desc 3",
            date: new Date(2020, 3, 7),
            time: 2.5,
        } as IRegistration),
        store.timesheets.addDocument(
            {
                userId: "user-1",
                description: "desc 3",
                date: new Date(2020, 3, 9),
                time: 4.50,
                created: new Date(2020, 3, 9, 17, 50, 0),
            } as IRegistration,
            "reg-1",
        ),
        store.timesheets.addDocument(
            {
                userId: "user-1",
                description: "desc 4",
                date: new Date(2020, 5, 9),
                time: 4.50,
                created: new Date(2020, 5, 9, 17, 50, 0),
            } as IRegistration,
            "reg-2",
        ),
    ]);

    store.auth.setUser({
        uid: "user-1",
        displayName: "user 1",
        email: "email@email.com",
    } as User);
    store.view.setViewDate({
        year: 2020,
        month: 4,
        day: 1,
    });

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

beforeEach(() => setupAsync());

afterEach(async () => {
    store.dispose();
    await testEnv.clearFirestore();
});

afterAll(() => testEnv.cleanup());

describe("RegistrationStore", () => {
    let unsubscribe: () => void;
    beforeEach(async () => {
        unsubscribe = reaction(() => store.timesheets.registrationsGroupedByDay, () => { });
    });

    afterEach(async () => {
        unsubscribe();
    });

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
            });

            it("should return no registrations when user logs out", async () => {
                await waitFor(() => {
                    expect(
                        store.timesheets.registrationsGroupedByDay.length
                    ).toBe(4);
                });

                store.auth.setUser(null);

                await waitFor(() => {
                    expect(store.user.divisionUser).toBeFalsy();
                    expect(
                        store.timesheets.registrationsGroupedByDay.length
                    ).toBe(0);
                });
            });
        });

        describe("when there are no registrations for the current user", () => {
            it("should return an empty list", async () => {
                store.auth.setUser({
                    uid: "user-2",
                    displayName: "user 2",
                    email: "email2@email.com",
                } as User)

                await waitFor(
                    () => expect(store.timesheets.registrationsGroupedByDay.length)
                        .toBe(0)
                );
            });
        });
    });

    describe("areGroupedRegistrationsCollapsed", () => {

        describe("when set from false (default) to true", () => {
            it("should set isCollapsed property of all groups to 'true'", async () => {
                await waitFor(() => expect(store.user.divisionUser).toBeDefined());
                await waitFor(() => expect(store.timesheets.collection.isFetched).toBeTruthy());

                store.timesheets.areGroupedRegistrationsCollapsed = true;

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

                await waitFor(() =>
                    expect(store.timesheets.registrationsGroupedByDay
                        .some(g => g.isCollapsed)
                    ).toBe(false)
                );
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
                await waitFor(() => expect(store.user.divisionUser).toBeDefined());
                await waitFor(() => expect(store.timesheets.collection.isFetched).toBeTruthy());

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
            await waitFor(
                () => expect(
                    store.timesheets.registrationsTotalTime
                ).toBe(13.5)
            );
        });
    });

    describe("setSelectedRegistration", () => {
        describe("when the requested registration id exists in the current filter", () => {
            it("should set selectedRegistration and selectedRegistrationId", async () => {
                await waitFor(() => expect(store.user.divisionUser).toBeDefined());
                await waitFor(() => expect(store.timesheets.collection.isFetched).toBeTruthy());

                store.timesheets.setActiveDocumentId("reg-1");

                expect(store.timesheets.activeDocumentId).toBe("reg-1");
                expect(store.timesheets.activeDocument).toBeDefined();
                expect(store.timesheets.activeDocument!.description).toBe("desc 3");
            });
        });

        describe("when the requested registration id does not exist in the current filter", () => {
            it("should fetch the registration and set selectedRegistration and selectedRegistrationId", async () => {
                await waitFor(() => expect(store.user.divisionUser).toBeDefined());
                await waitFor(() => expect(store.timesheets.collection.isFetched).toBeTruthy());

                store.timesheets.setActiveDocumentId("reg-2");

                await waitFor(() => {
                    expect(store.timesheets.activeDocumentId).toBe("reg-2");
                    expect(store.timesheets.activeDocument).toBeDefined();
                    expect(store.timesheets.activeDocument!.description).toBe("desc 4");
                });

                store.timesheets.setActiveDocumentId(undefined);
            });
        });
    });

    describe("saveSelectedRegistration", () => {
        it("should save changes to the selected registration", async () => {
            await waitFor(() => expect(store.user.divisionUser).toBeDefined());
            await waitFor(() => expect(store.timesheets.collection.isFetched).toBeTruthy());

            store.timesheets.setActiveDocumentId("reg-1");

            await waitFor(() => {
                expect(store.timesheets.activeDocument).toBeDefined();
            })

            expect(store.timesheets.activeDocumentId).toBe("reg-1");
            expect(store.timesheets.activeDocument!.description).toBe("desc 3");

            store.timesheets.activeDocument!.description = "desc 3 a";
            store.timesheets.activeDocument!.project = "project-1";

            expect(store.timesheets.activeDocument!.description).toBe("desc 3 a");

            await store.timesheets.saveSelectedRegistration();

            await waitFor<void>(async () => {
                const reg = await store.timesheets.collection.getAsync("reg-1")
                    .then(doc => doc.data);

                return expect(reg).toEqual(
                    expect.objectContaining({
                        description: "desc 3 a",
                        project: "project-1",
                    })
                );
            });

            // After saving the activeDocumentId and activeDocument should have been reset
            expect(store.timesheets.activeDocumentId).toBeUndefined();
            expect(store.timesheets.activeDocument).toBeUndefined();
        });
    });

    describe("toggleSelectedRegistrationDay", () => {
        it("should set selectedRegistrationDays property", async () => {
            await waitFor(() => expect(store.user.divisionUser).toBeDefined());
            await waitFor(() => expect(store.timesheets.collection.isFetched).toBeTruthy());

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
});
