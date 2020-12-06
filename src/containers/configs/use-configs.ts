import { useConfigStore } from "../../stores/config-store";
import { useEffect, useState } from "react";
import { reaction } from "mobx";

export const useConfigs = () => {
    const configStore = useConfigStore();

    const fn = () => configStore.configsCollection.isFetched
        ? configStore.getConfigValue.bind(configStore)
        : () => undefined;

    const [getConfigValue, setgetConfigValue] = useState<ReturnType<typeof fn>>(fn);

    useEffect(
        () => {
            return reaction(() => configStore.configsCollection.isFetched, (isFetched) => {
                if (isFetched) {
                    setgetConfigValue(fn);
                }
            });
        },
        [
            configStore,
        ]
    );

    return {
        getConfigValue,
    }
};
