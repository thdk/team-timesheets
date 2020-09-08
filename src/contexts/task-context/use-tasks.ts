import { useConfigs } from "../../stores/config-store/use-config-store";
import { useObserver } from "mobx-react-lite";

export const useTasks = () => {
    const configStore = useConfigs();

    return useObserver(() => ({
        tasks: configStore.tasks,
        addAsync: configStore.tasksCollection.addAsync.bind(configStore.tasksCollection),
        taskId: configStore.taskId,
        setTaskId: configStore.setTaskId.bind(configStore),
    }));
}
