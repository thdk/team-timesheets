import React from "react";
import { useFirebase } from "../firebase-context/firebase-context";
import { StoreContext } from "./store-context";
import { Store, IRootStore } from "../../stores/root-store";

export const StoreProvider = ({ children, testStore }: React.PropsWithChildren<{ testStore?: IRootStore }>) => {

    const firebase = useFirebase();

    if (testStore) {
        return (
            <StoreContext.Provider value={testStore}>
                {children}
            </StoreContext.Provider>
        );
    }

    const auth = firebase.auth();
    const firestore = firebase.firestore();
    const functions = firebase.functions();

    const store = (window as any)["store"] = testStore || new Store({
        auth,
        firestore,
        httpsCallable: functions.httpsCallable.bind(functions),
    });

    return (
        <StoreContext.Provider value={store}>
            {children}
        </StoreContext.Provider>
    );
}
