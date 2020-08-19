import { useStore } from "../../contexts/store-context"

export const useProjectStore = () => {
    const store = useStore();
    return store.projects;
}