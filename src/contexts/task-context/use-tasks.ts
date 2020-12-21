import { useObserver } from "mobx-react-lite";
import { useStore } from "../store-context";

export const useTasks = () => {
    const store = useStore();

    return useObserver(() => ({
        tasks: store.tasks.tasks,
        addAsync: store.tasks.collection.addAsync.bind(store.tasks.collection),
        taskId: store.tasks.activeDocumentId,
        setTaskId: store.tasks.setActiveDocumentId.bind(store.tasks),
        get: store.tasks.collection.get.bind(store.tasks.collection),
        store: store.tasks,
    }));
};
