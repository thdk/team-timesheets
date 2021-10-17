import React from "react";
import fs from "fs";
import path from "path";

import { ProjectSelect } from "./";
import { render, waitFor } from "@testing-library/react";
import { RulesTestEnvironment, initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { Store } from "../../../stores/root-store";
import { useStore } from "../../../contexts/store-context";
import userEvent from "@testing-library/user-event";
import { User } from "firebase/auth";

jest.mock("../../../contexts/store-context");

const projectId = "project-select-test";

let testEnv: RulesTestEnvironment;
let firestore: any;

beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
        projectId,
        firestore: {
            rules: fs.readFileSync(path.resolve(__dirname, "../../../../firestore.rules.test"), "utf8"),
        }
    });

    firestore = testEnv.unauthenticatedContext().firestore();
});

let store: Store;
beforeEach(async () => {
    store = new Store({
        firestore,
    });
    (useStore as jest.Mock<ReturnType<typeof useStore>>).mockReturnValue(store);

    await store.user.usersCollection.addAsync(
            {
                name: "user 1",
                team: "team-1",
                roles: {
                    user: true,
                },
                uid: "user-1",
                tasks: new Map(),
                recentProjects: [],
                divisionId: "",
            },
            "user-1",
        );

    store.auth.setUser({
        uid: "user-1",
    } as User);

});

afterEach(async () => {
    try {
        store.dispose();
    } catch (error) {
        console.error(error);
    }
    await testEnv.clearFirestore();
});

afterAll(() => testEnv.cleanup());

describe("ProjectsSelect", () => {
    it("should render without projects", () => {
        const {
            asFragment,
        } = render(
            <ProjectSelect
                onChange={jest.fn()}
                value={undefined}
            />
        );

        expect(asFragment()).toMatchSnapshot();
    });

    describe("when there are projects", () => {
        let projectIds: string[];
        beforeEach(async () => {
            try {
                const projectId1 = await store.projects.addDocument(
                    {
                        name: "Project 1",
                        createdBy: "user-1",
                    }
                )

                const projectId2 = await store.projects.addDocument(
                    {
                        name: "Project 2",
                        isArchived: true,
                        createdBy: "user-1",
                    },
                )

                const projectId3 = await store.projects.addDocument(

                    {
                        name: "Project 3",
                        createdBy: "user-1",
                    },
                )

                const projectId4 = await store.projects.addDocument(
                    {
                        name: "Project 4",
                        createdBy: "user-1",
                    },
                );
                projectIds = [
                    projectId1,
                    projectId2,
                    projectId3,
                    projectId4,
                ];
                console.log({
                    projectIds
                })
            } catch (e) {
                console.error(e);
                throw e;
            }

        });

        it("should show an option for each active project", async () => {
            const {
                getByText,
                queryByText,
                unmount,
            } = render(
                <ProjectSelect
                    onChange={jest.fn()}
                    value={undefined}
                />
            );

            await waitFor(() => getByText("Project 1"));
            await waitFor(() => getByText("Project 3"));
            await waitFor(() => getByText("Project 4"));

            expect(queryByText("Project 2")).toBeFalsy();

            unmount();
        });

        xit("should call onChange when project is selected", async () => {
            const onChange = jest.fn();
            const {
                container,
                getByText,
                unmount,
            } = render(
                <ProjectSelect
                    value={undefined}
                    onChange={onChange}
                />
            );

            await waitFor(() => getByText("Project 3"));

            const selectEl = container.querySelector("select");
            expect(selectEl).toBeDefined();
            userEvent.selectOptions(selectEl!, [projectIds[2]]);

            await waitFor(() => {
                expect(onChange).toBeCalledWith(projectIds[2]);
            });

            unmount();
        });

        it("should select the given project", async () => {
            const {
                container,
                unmount,
            } = render(
                <ProjectSelect
                    value={projectIds[3]}
                    onChange={jest.fn()}
                />
            );

            await waitFor(
                () => expect(
                    container.querySelector("select")?.value
                ).toBe(projectIds[3]),
            );

            unmount();
        });

        it("should be disabled when the given project is archived", async () => {
            const {
                container,
                unmount,
            } = render(
                <ProjectSelect
                    value={projectIds[1]}
                    onChange={jest.fn()}
                />
            );

            await waitFor(
                () => expect(
                    container.querySelector("select")?.value
                ).toBe(projectIds[1]),
            );

            expect(container.querySelector("select")?.disabled).toBeTruthy();

            unmount();
        });

        describe("when the user has recent projects", () => {
            beforeEach(async () => {
                await store.user.usersCollection.updateAsync({
                    recentProjects: [
                        projectIds[3],
                    ],
                }, "user-1");
            });

            it("should display recent projects on top of other projects in select", async () => {
                const {
                    container,
                    unmount,
                } = render(
                    <ProjectSelect
                        onChange={jest.fn()}
                        value={undefined}
                    />
                );

                await waitFor(() => expect(store.user.authenticatedUser?.recentProjects).toEqual([
                    projectIds[3],
                ]));
                await waitFor(() => expect(
                    Array.from(container.querySelectorAll("option")).map(el => el.innerHTML)
                ).toEqual([
                    "",
                    "/ Recent projects /",
                    "Project 4",
                    "",
                    "/ More projects /",
                    "Project 1",
                    "Project 3",
                ],
                ));

                unmount();
            });
        })
    });


});