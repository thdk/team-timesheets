import { Store } from "../root-store";
import path from "path";
import fs from "fs";
import type firebase from "firebase";
import { waitFor } from "@testing-library/react";
import { initializeTestApp, loadFirestoreRules, clearFirestoreData, } from "@firebase/rules-unit-testing";
import { useStore } from "../../contexts/store-context";

jest.mock("../../contexts/store-context");

const projectId = "project-store-test";
const app = initializeTestApp({
    projectId,
});


let divisionUserId1: string;
let divisionUserId2: string;
const divisionId1 = "div-1";
const divisionId2 = "div-2";

let store: Store;
const setupAsync = async () => {
    store = new Store({
        firestore: app.firestore(),
    });

    await Promise.all([
        store.auth.collection.addAsync(
            {
                name: "user 1",
                team: "team-1",
                roles: {
                    user: true,
                },
                uid: "user-1",
                divisionId: "",
                recentProjects: [],
                tasks: new Map(),
            },
            "user-1",
        ),
        store.divisions.addDocuments([
            {
                name: "Division 1",
                createdBy: "user-1",
                icon: "business",
                id: divisionId1
            },
            {
                name: "Division 2",
                createdBy: "user-2",
                icon: "house",
                id: divisionId2
            },
        ]),
    ]);

    const [
        generatedDivisionUserId1,
        generatedDivisionUserId2,
    ] = await store.user.divisionUsersCollection.addAsync([
        {
            name: "Division User 1",
            divisionId: divisionId1,
            tasks: new Map<string, true>(),
            recentProjects: [] as string[],
            uid: "user-1",
            roles: {}
        },
        {
            name: "Division User 2",
            divisionId: divisionId2,
            tasks: new Map<string, true>(),
            recentProjects: [] as string[],
            uid: "user-1",
            roles: {}
        },
    ]);

    divisionUserId1 = generatedDivisionUserId1;
    divisionUserId2 = generatedDivisionUserId2;

    store.auth.setUser({
        uid: "user-1",
    } as firebase.User);
};

beforeAll(async () => {
    await loadFirestoreRules({
        projectId,
        rules: fs.readFileSync(path.resolve(__dirname, "../../../firestore.rules.test"), "utf8"),
    })
});

beforeEach(async () => {
    await setupAsync();
    (useStore as jest.Mock<ReturnType<typeof useStore>>).mockReturnValue(store);
});

afterEach(async () => {
    await store.dispose();
    await clearFirestoreData({
        projectId,
    });
});

afterAll(() => app.delete());

describe("ProjectStore", () => {

    describe("activeProjects", () => {
        describe("when there are no projects", () => {
            it("should return an empty array", () => {
                expect(store.projects.activeProjects.length).toBe(0);
            });
        });

        describe("when there are projects", () => {
            beforeEach(async () => {
                await store.projects.addDocuments([
                    {
                        name: "Project 1",
                        divisionId: "",
                    },
                    {
                        name: "Project 2",
                        isArchived: true,
                        divisionId: "",
                    },
                    {
                        name: "Project 3",
                        divisionId: "",
                    },
                    {
                        name: "Project 4",
                        divisionId: "",
                    },
                    {
                        name: "Project 5",
                        divisionId: divisionId1,
                    },
                    {
                        name: "Project 6",
                        divisionId: divisionId1,
                    },
                    {
                        name: "Project 7",
                        divisionId: divisionId2,
                    },
                ]);
            });

            it("should return an array of active projects", async () => {
                await waitFor(() => expect(store.user.divisionUser).toBeDefined());
                await waitFor(() => expect(store.projects.activeProjects.length).toBe(3));
            });

            it("should return only projects of the current division user", async () => {
                await waitFor(() => expect(store.user.divisionUser).toBeDefined());

                await waitFor(() => expect(store.projects.activeProjects.length).toBe(3));

                store.auth.updateActiveDocument({
                    divisionUserId: divisionUserId1,
                    divisionId: divisionId1,
                });

                await waitFor(() => expect(store.projects.activeProjects.length).toBe(2));

                store.auth.updateActiveDocument({
                    divisionUserId: divisionUserId2,
                    divisionId: divisionId2,
                });

                await waitFor(() => expect(store.projects.activeProjects.length).toBe(1));

                store.auth.updateActiveDocument({
                    divisionUserId: undefined,
                    divisionId: undefined,
                });

                await waitFor(() => expect(store.projects.activeProjects.length).toBe(3));
            });
        });
    });

    describe("unarchiveProjects & archiveProjects", () => {
        let projectIds: string[];
        beforeEach(async () => {
            projectIds = await store.projects.addDocuments([
                {
                    name: "Project 1",
                    divisionId: "",
                },
                {
                    name: "Project 2",
                    isArchived: true,
                    divisionId: "",
                },
            ]);
        });

        it("should update activeProjects and archivedProjects accordingly", async () => {
            await waitFor(() => expect(store.projects.activeProjects.length).toBe(1));
            await waitFor(() => expect(store.projects.archivedProjects.length).toBe(1));

            store.projects.archiveProjects(projectIds[0]);

            await waitFor(() => expect(store.projects.activeProjects.length).toBe(0));
            await waitFor(() => expect(store.projects.archivedProjects.length).toBe(2));

            store.projects.unarchiveProjects(projectIds[0]);

            await waitFor(() => expect(store.projects.activeProjects.length).toBe(1));
            await waitFor(() => expect(store.projects.archivedProjects.length).toBe(1));
        });
    });

    describe("addDocument", () => {
        it("should add a project", async () => {
            await waitFor(() => expect(store.user.divisionUser).toBeDefined());
            await waitFor(() => expect(store.projects.activeProjects.length).toBe(0));
            store.projects.addDocument(
                {
                    name: "New project 1",
                    createdBy: "user-1",
                    divisionId: "",
                },
                "new-project-1",
            );

            await waitFor(() => expect(store.projects.activeProjects.length).toBe(1));

            store.projects.deleteDocuments(
                {
                    useFlag: false,
                },
                "new-project-1",
            );

            await waitFor(() => expect(store.projects.activeProjects.length).toBe(0));
        });

        it("should throw when createdBy prop is missing on new project data", async () => {
            await waitFor(() => expect(store.user.divisionUser).toBeDefined());
            store.projects.createNewDocument
            expect(() => store.projects.addDocument({
                name: "Invalid project",
                divisionId: "",
            })).toThrow();
        });
    });

    describe("createNewDocument", () => {
        it("should set default data on new active document", async () => {
            await waitFor(() => expect(store.user.divisionUser).toBeDefined());
            store.projects.createNewDocument();

            await waitFor(() => expect(store.projects.activeDocument?.createdBy).toBe("user-1"));
        });
    });
});