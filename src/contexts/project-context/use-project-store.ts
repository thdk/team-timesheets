import { useStore } from "../store-context"

export const useProjectStore = () => {
    const store = useStore();
    return store.projects;
}