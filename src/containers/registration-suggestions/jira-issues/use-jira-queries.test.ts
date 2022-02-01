import { useCollectionData } from "react-firebase-hooks/firestore";
import { renderHook } from "@testing-library/react-hooks";
import { useJiraQueries } from "./use-jira-queries";

jest.mock("firebase/firestore");
jest.mock("react-firebase-hooks/firestore");
jest.mock("../../../contexts/firebase-context");

describe("useJiraQueries", () => {
    it("returs an array of jira query objects", () => {
        (useCollectionData as unknown as jest.Mock<[{ jql: string; taskId: string; id: string; }[]]>)
            .mockReturnValue([
                [
                    {
                        jql: "foo=bar",
                        taskId: "task-1",
                        id: "1",
                    },
                ],
            ]);

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
