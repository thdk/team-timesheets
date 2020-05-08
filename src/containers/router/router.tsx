import React from "react";
import { useEffect } from "react";
import { useStore } from "../../contexts/store-context";
import { routes } from "../../internal";
import { startRouter, MobxRouter } from "mobx-router";

export const Router = () => {
    const store = useStore();

    useEffect(() => {
        startRouter(routes, store);
    }, [store]);

    return <MobxRouter store={store} />
}
