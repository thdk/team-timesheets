import { useConfigStore } from "../../stores/config-store";
import { useEffect, useState } from "react";
import { reaction } from "mobx";

export const useConfigs = () => {
    const configStore = useConfigStore();

    const [areConfigsFetched, setAreConfigsFetched] = useState(configStore.configsCollection.isFetched);

    useEffect(
        () => {
            reaction(() => configStore.configsCollection.isFetched, (isFetched) => {
                if (isFetched !== areConfigsFetched) {
                    setAreConfigsFetched(isFetched);
                }
            });
        }, [
        configStore,
        areConfigsFetched,
    ]);

    return {
        getConfigValue: configStore.getConfigValue.bind(configStore),
    }
};
