import { useStore } from "../../contexts/store-context"

export const useConfigs = () => {
    const { config } = useStore();

    return config;
}