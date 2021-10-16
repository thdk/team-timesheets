import { useConfigStore } from "../../stores/config-store/use-config-store";

export const useClients = () => {
    const configStore = useConfigStore();
    return configStore;
}