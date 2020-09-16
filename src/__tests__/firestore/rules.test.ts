import {
    initTestFirestore,
    deleteFirebaseAppsAsync,
} from "../utils/firebase";
import {
    assertFails,
    assertSucceeds,
} from "@firebase/testing";

const {
    refs: [
        usersRef,
    ],
    refsTest: [
        usersRefTest,
    ]
} = initTestFirestore(
    "rules-test",
    ["users"],
    { uid: "alice", email: "alice@example.com" },
    "../../../firestore.rules",
);

beforeAll(async () => {
    await usersRef.doc("alice").set({ uid: "alice", roles: { user: true }, organisationId: "o-1" });
    await usersRef.doc("john").set({ uid: "john", roles: { user: true } });
    await usersRef.doc("peter").set({ uid: "peter", roles: { user: true }, organisationId: "o-1" });
    await usersRef.doc("jack").set({ uid: "jack", roles: { user: true }, organisationId: "o-2" });
});

afterAll(deleteFirebaseAppsAsync);

describe("Firestore rules", () => {
    describe("users collection", () => {
        test("if user can read its own doc", async () => {
            await assertSucceeds(usersRefTest.doc("alice").get());
        });

        test("if user can't read someone elses doc", async () => {
            await assertFails(usersRefTest.doc("john").get());
        });

        test("if user can update its own doc", async () => {
            await assertSucceeds(usersRefTest.doc("alice").update({
                name: "foo"
            }));
        });

        test("if user can't update someone elses doc", async () => {
            await assertFails(usersRefTest.doc("peter").update({
                name: "foo"
            }));
        });

        test("if user can't update its own roles", async () => {
            await assertFails(usersRefTest.doc("alice").update({
                roles: { admin: true },
            }));
        });

        test("if user can insert new doc", async () => {
            await assertSucceeds(
                usersRefTest.doc(Date.now().toString()).set({
                    roles: { user: true },
                    uid: "alice",
                })
            );
        });

        test("if user can't delete docs", async () => {
            await assertFails(
                usersRefTest.doc("alice").delete()
            );

            await assertFails(
                usersRefTest.doc("peter").delete()
            );

            await assertFails(
                usersRefTest.doc("jack").delete()
            );

            await assertFails(
                usersRefTest.doc("john").delete()
            );
        });

        describe("when current user is admin", () => {
            beforeAll(async () => {
                await usersRef.doc("alice").update({
                    roles: { admin: true },
                });
            });

            afterAll(async () => {
                await usersRef.doc("alice").update({
                    roles: { admin: false },
                });
            });

            test("if admin can read other users doc from same organisation", async () => {
                // john has no organisation set (backwards compatibility)
                await assertSucceeds(usersRefTest.doc("john").get());

                // peter has organisation set
                await assertSucceeds(usersRefTest.doc("peter").get());
            });

            test("if admin cannot read other users doc from another organisation", async () => {
                // jack is in another organisation
                await assertFails(usersRefTest.doc("jack").get());
            });

            test("if admin can update its own roles", async () => {
                await assertSucceeds(usersRefTest.doc("alice").update({
                    roles: {
                        editor: true,
                        admin: true,
                     },
                }));
            });

            test("if admin can delete other user docs from same organisation", async () => {
                const john = await usersRef.doc("john").get();
                const peter = await usersRef.doc("peter").get();

                // john has no organisation set (backwards compatibility)
                await assertSucceeds(usersRefTest.doc("john").delete());

                // peter has organisation set
                await assertSucceeds(usersRefTest.doc("peter").delete());

                await usersRef.doc("john").set({...john.data()});
                await usersRef.doc("peter").set({...peter.data()});
            });
        });
    });
});
