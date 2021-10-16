import {
    initTestFirestore,
} from "../utils/firebase";
import {
    assertFails,
    assertSucceeds,
} from "@firebase/rules-unit-testing";

let cleanup: () => unknown;
let divisonUsersRef: any;
let divisonUsersRefTest: any;
let usersRefTest: any;
let usersRef: any;

beforeAll(async () => {
    try {


        const {
            cleanup: cleanupTemp,
            refs: [
                usersRefTemp,
                divisonUsersRefTemp,
            ],
            refsTest: [
                usersRefTestTemp,
                divisonUsersRefTestTemp,
            ]
        } = await initTestFirestore(
            "rules-test",
            [
                "users",
                "division-users",
            ],
            { uid: "alice", email: "alice@example.com" },
            "../../../firestore.rules",
        );
        await usersRefTemp.doc("alice").set({ uid: "alice", roles: { user: true }, divisionUserId: "alice-div" });
        await divisonUsersRefTemp.doc("alice-div").set({ uid: "alice", divisionId: "o-1", roles: { user: true } });

        await usersRefTemp.doc("john").set({ uid: "john", roles: { user: true } });

        await usersRefTemp.doc("peter").set({ uid: "peter", divisionUserId: "peter-div" });
        await divisonUsersRefTemp.doc("peter-div").set({ uid: "peter", divisionId: "o-1", roles: { user: true } });

        await usersRefTemp.doc("jack").set({ uid: "jack", divisionUserId: "jack-div" });
        await divisonUsersRefTemp.doc("jack-div").set({ uid: "jack", divisionId: "o-2", roles: { user: true } });

        await usersRefTemp.doc("martin").set({ uid: "martin", divisionUserId: "martin-div" });
        await divisonUsersRefTemp.doc("martin-div").set({ uid: "martin", divisionId: "o-1", roles: { user: true } });

        divisonUsersRef = divisonUsersRefTemp;
        divisonUsersRefTest = divisonUsersRefTestTemp;
        usersRefTest = usersRefTestTemp;
        usersRef = usersRefTemp;
        cleanup = cleanupTemp;
    } catch (e) {
        console.error(e);
    }
});

afterAll(() => cleanup());

xdescribe("Firestore rules", () => {
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
                    roles: { recruit: true },
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

                await divisonUsersRef.doc("alice-div").update({
                    roles: { admin: true },
                });
            });

            afterAll(async () => {
                await usersRef.doc("alice").update({
                    roles: { admin: false },
                });

                await divisonUsersRef.doc("alice-div").update({
                    roles: { admin: false },
                });
            });

            test("if admin can read other users doc from same organisation", async () => {
                // john has no organisation set (backwards compatibility)
                await assertSucceeds(usersRefTest.doc("john").get());

                // peter has organisation set
                await assertSucceeds(divisonUsersRefTest.where("divisionId", "==", "o-1").get());
            });

            test("if admin cannot read other users doc from another organisation", async () => {
                // jack is in another organisation
                await assertFails(divisonUsersRefTest.doc("jack-div").get());
            });

            test("if admin can update its own roles", async () => {
                await assertSucceeds(usersRefTest.doc("alice").update({
                    roles: {
                        editor: true,
                        admin: true,
                    },
                }));
            });

            test("if admin can update other user docs from same organisation", async () => {
                // john has no organisation set (backwards compatibility)
                await assertSucceeds(usersRefTest.doc("john").update({ foo: "bar" }));

                // peter has organisation set
                await assertSucceeds(divisonUsersRefTest.doc("peter-div").update({ foo: "bar" }));
            });
        });
    });
});
