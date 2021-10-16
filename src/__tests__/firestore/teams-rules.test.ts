import {
    initTestFirestore,
} from "../utils/firebase";
import {
    assertFails,
    assertSucceeds,
} from "@firebase/rules-unit-testing";

import type Firebase from "firebase/compat";

xdescribe("Firestore rules", () => {

    let teamsRefTest: Firebase.firestore.CollectionReference;
    let usersRef: Firebase.firestore.CollectionReference;
    let cleanup: () => Promise<[void, void]>;

    beforeAll(async () => {
        try {

            const {
                cleanup: cleanupTemp,
                refs: [
                    teamsRef,
                    usersRefTemp,
                ],
                refsTest: [
                    teamsRefTestTemp,
                ]
            } = await initTestFirestore(
                "teams-rules-test",
                ["teams", "users"],
                { uid: "alice", email: "alice@example.com" },
                "../../../firestore.rules",
            ).catch((e) => {
                console.error(e);
                throw e;
            });
            await usersRefTemp.doc("alice").set({ uid: "alice", roles: { user: true } });
            await teamsRef.doc("team-1").set({ name: "team-1" });

            teamsRefTest = teamsRefTestTemp;
            cleanup = cleanupTemp;
            usersRef = usersRefTemp;
        } catch (error) {
            console.error(error);
            throw error;
        }
    });

    afterAll(() => cleanup());

    describe("teams collection", () => {
        test("if user can read teams collection", async () => {
            await assertSucceeds(teamsRefTest.doc("team-1").get());
        });

        test("if user cannot update teams collection", async () => {
            await assertFails(teamsRefTest.doc("team-1").update({
                name: "foo"
            }));
        });

        test("if user cannot insert new team", async () => {
            await assertFails(
                teamsRefTest.doc("team-2").set({
                    name: "Foo",
                })
            );
        });

        test("if user can't delete from teams collection", async () => {
            await assertFails(
                teamsRefTest.doc("team-1").delete()
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

            test("if admin can read teams collection", async () => {
                await assertSucceeds(teamsRefTest.doc("team-1").get());
            });

            test("if admin can update teams collection", async () => {
                await assertSucceeds(teamsRefTest.doc("team-1").update({
                    name: "foo"
                }));
            });

            test("if admin can insert new team", async () => {
                await assertSucceeds(
                    teamsRefTest.doc("team-2").set({
                        name: "Foo",
                    })
                );
            });

            test("if admin can delete from teams collection", async () => {
                await assertSucceeds(
                    teamsRefTest.doc("team-1").delete()
                );
            });
        });
    });
});
