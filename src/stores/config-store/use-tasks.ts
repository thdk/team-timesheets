import { useConfigs } from "./use-config-store";
import { useObserver } from "mobx-react-lite";

export const useTasks = () => {
    const configStore = useConfigs();

    return useObserver(() => ({
        tasks: configStore.tasks,
        addAsync: configStore.tasksCollection.addAsync.bind(configStore),
        taskId: configStore.taskId,
        setTaskId: configStore.setTaskId.bind(configStore),
    }));
}
