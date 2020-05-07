import { useStore } from "../../contexts/store-context"

export const useProjectStore = () => {
    const { projects } = useStore();

    return projects;
}