import { useStore } from "../../contexts/store-context"

export const useConfigStore = () => {
    const { config } = useStore();

    return config;
}