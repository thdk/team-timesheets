import * as React from "react";

import store from "../../../stores/root-store";
import { observer } from "mobx-react-lite";
import { ConfigValue } from "../../../../common/dist";

export function withConfigValues<T extends {
    [key: string]: ConfigValue;
}>(
    WrappedComponent: React.ComponentType<{ configs: T }>,
    configKeys: (keyof T)[]
) {

    const ComponentWithConfigValues = () => {
        if (!store.config.configsCollection.isFetched) {
            return null;
        }

        const configs = configKeys.reduce((p, configKey) => {
            p[configKey] = store.config.getConfigValue(configKey as string);
            return p;
        }, {} as T);

        return <WrappedComponent configs={configs} />;
    }

    return observer(ComponentWithConfigValues);
}
