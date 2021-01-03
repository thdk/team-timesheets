import { useStore } from "../store-context";

export const useTasks = () => {
    const store = useStore();

    return store.tasks;
};
