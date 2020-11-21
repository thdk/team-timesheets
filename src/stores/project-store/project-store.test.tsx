import { Store } from "../root-store";
import { initTestFirestore, deleteFirebaseAppsAsync } from "../../__tests__/utils/firebase";
import { TestCollection } from "../../__tests__/utils/firestorable/collection";
import { IProject, IProjectData, IUserData } from "../../../common";
import * as serializer from '../../../common/serialization/serializer';
import { waitFor } from "@testing-library/react";

const {
    firestore,
    clearFirestoreDataAsync,
    refs: [
        userRef,
        divisionUserRef,
        divisionRef,
        projectRef,

    ]
} = initTestFirestore("project-store-test",
    [
        "users",
        "divisionUsers",
        "divisions",
        "projects",
    ]);

const userCollection = new TestCollection<IUserData>(
    firestore,
    userRef,
);
const divisionUserCollection = new TestCollection(
    firestore,
    divisionUserRef,
    {
        serialize: serializer.convertUser,
        defaultSetOptions: {
            merge: true,
        },
    },
);
const divisionCollection = new TestCollection(
    firestore,
    divisionRef,
    {
        serialize: serializer.convertDivision,
    }
);
const projectCollection = new TestCollection<IProject, IProjectData>(
    firestore,
    projectRef,
    {
        serialize: serializer.convertProject,
    },
);

const store = new Store({ firestore });

let userId: string;
let divisionUserId1: string;
let divisionUserId2: string;
const divisionId1 = "div-1";
const divisionId2 = "div-2";

const setupAsync = async () => {
    const [
        generatedUserId,
    ] = await Promise.all([
        userCollection.addAsync(
            {
                name: "user 1",
                team: "team-1",
                roles: {
                    user: true,
                }
            }
        ),
        divisionCollection.addAsync([
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

    userId = generatedUserId;

    const [
        generatedDivisionUserId1,
        generatedDivisionUserId2,
    ] = await divisionUserCollection.addAsync([
        {
            name: "Division User 1",
            divisionId: divisionId1,
            tasks: new Map<string, true>(),
            recentProjects: [] as string[],
            uid: userId,
            roles: {}
        },
        {
            name: "Division User 2",
            divisionId: divisionId2,
            tasks: new Map<string, true>(),
            recentProjects: [] as string[],
            uid: userId,
            roles: {}
        },
    ]);

    divisionUserId1 = generatedDivisionUserId1;
    divisionUserId2 = generatedDivisionUserId2;

    store.auth.setUser({
        uid: userId,
    } as firebase.User);
};

beforeAll(() => Promise.all([
    clearFirestoreDataAsync(),
    setupAsync(),
]));

afterAll(deleteFirebaseAppsAsync);

describe("ProjectStore", () => {

    describe("activeProjects", () => {
        describe("when there are no projects", () => {
            it("should return an empty array", () => {
                expect(store.projects.activeProjects.length).toBe(0);
            });
        });

        describe("when there are projects", () => {
            let projectIds: string[];
            beforeAll(async () => {
                projectIds = await projectCollection.addAsync([
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

            afterAll(() => {
                return projectCollection.deleteAsync(...projectIds);
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
        beforeAll(async () => {
            projectIds = await projectCollection.addAsync([
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

        afterAll(() => {
            return projectCollection.deleteAsync(...projectIds);
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

            await waitFor(() => expect(store.projects.activeDocument?.createdBy).toBe(userId));
        });
    });
});