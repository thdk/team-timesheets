import { useCollection } from "react-firebase-hooks/firestore";
import { renderHook } from "@testing-library/react-hooks";
import { useJiraQueries } from "./use-jira-queries";
import { Collection } from "firestorable";

jest.mock("firebase/firestore");
jest.mock("react-firebase-hooks/firestore");
jest.mock("../../../contexts/firebase-context");

describe("useJiraQueries", () => {
    it("returs an array of jira query objects", () => {
        (useCollection as unknown as jest.Mock<[Collection<any>]>)
            .mockReturnValue([{
                docs: [{
                    data: () => ({
                        jql: "foo=bar",
                        taskId: "task-1",
                    }),
                    id: "1",
                }],
            } as Collection<any>]);

        const { result } = renderHook(() => useJiraQueries());

        expect(result.current).toStrictEqual([
            {
                jql: "foo=bar",
                taskId: "task-1",
                id: "1",
            }
        ]);
    });
});
