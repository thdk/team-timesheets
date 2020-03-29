import * as React from "react";

import store from "../../../stores/root-store";
import { observer } from "mobx-react-lite";
import { ConfigValue } from "../../../../common/dist";

export function withConfigValues<T extends {
    [key: string]: ConfigValue;
}>(
    WrappedComponent: React.ComponentType<{ configs: T }>,
    configRequests: ({ key: keyof T, defaultValue?: ConfigValue })[]
) {

    const ComponentWithConfigValues = () => {
        if (!store.config.configsCollection.isFetched) {
            return null;
        }

        const configs = configRequests.reduce((p, configRequest) => {
            p[configRequest.key] = (
                store.config.getConfigValue(configRequest.key as string, configRequest.defaultValue === undefined)
                || configRequest.defaultValue
            ) as T[keyof T];
            return p;
        }, {} as T);

        return <WrappedComponent configs={configs} />;
    }

    return observer(ComponentWithConfigValues);
}
