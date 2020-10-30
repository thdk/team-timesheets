import { useConfigs as useConfigStore } from "../../stores/config-store";
import { useEffect, useState } from "react";
import { reaction } from "mobx";

export const useConfigs = () => {
    const configStore = useConfigStore();

    const [areConfigsFetched, setAreConfigsFetched] = useState(configStore.configsCollection.isFetched);

    console.log({ areConfigsFetched });
    useEffect(
        () => {
            reaction(() => configStore.configsCollection.isFetched, (isFetched) => {
                console.log({ isFetched });
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
