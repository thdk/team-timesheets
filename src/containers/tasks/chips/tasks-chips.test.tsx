import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { TasksChips } from "./tasks-chips";

const tasks = [
    {
        id: "1",
        name: "Task 1",
        icon: "people",
    },
    {
        id: "2",
        name: "Task 2",
    },
    {
        id: "3",
        name: "Task 3",
        icon: "people",
    },
];

describe("TasksChips", () => {
    it("should render empty when no tasks", () => {
        const { asFragment } = render(<TasksChips
            onTaskInteraction={jest.fn()}
            tasks={[]}
        />);

        expect(asFragment()).toMatchSnapshot();
    });

    it("should render chip for each task", () => {
        const { getByText } = render(<TasksChips
            onTaskInteraction={jest.fn()}
            tasks={tasks}
        />);

        expect(getByText("Task 1"));
        expect(getByText("Task 2"));
        expect(getByText("Task 3"));
    });

    it("should show selected task ids", () => {
        const { container } = render(<TasksChips
            onTaskInteraction={jest.fn()}
            tasks={tasks}
            selectedTaskIds={["3"]}
        />);

        expect(container.querySelector(".mdc-chip--selected")).not.toBeNull();
    });

    it("should call onInteraction when chips are being interacted with", () => {
        const onInteraction = jest.fn();

        const { container } = render(<TasksChips
            onTaskInteraction={onInteraction}
            tasks={tasks}
            selectedTaskIds={["3"]}
        />);

        const selectedChip = container.querySelector(".mdc-chip--selected");
        expect(selectedChip).not.toBeNull();

        fireEvent.click(selectedChip!);

        expect(onInteraction).toBeCalledTimes(1);
    });
});

