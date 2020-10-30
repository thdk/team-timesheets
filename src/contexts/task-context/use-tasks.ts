import { useConfigStore } from "../../stores/config-store/use-config-store";
import { useObserver } from "mobx-react-lite";

export const useTasks = () => {
    const configStore = useConfigStore();

    return useObserver(() => ({
        tasks: configStore.tasks,
        addAsync: configStore.tasksCollection.addAsync.bind(configStore.tasksCollection),
        taskId: configStore.taskId,
        setTaskId: configStore.setTaskId.bind(configStore),
        get: configStore.tasksCollection.get.bind(configStore.tasksCollection),
    }));
}
