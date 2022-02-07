import React from "react";
import { useFirebase } from "../firebase-context/firebase-context";
import { StoreContext } from "./store-context";
import { Store, IRootStore } from "../../stores/root-store";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";



export const StoreProvider = ({ children, testStore }: React.PropsWithChildren<{ testStore?: IRootStore }>) => {

    const firebase = useFirebase();

    if (testStore) {
        return (
            <StoreContext.Provider value={testStore}>
                {children}
            </StoreContext.Provider>
        );
    }

    const auth = getAuth(firebase);
    const firestore = getFirestore(firebase);
    const functions = getFunctions(firebase);

    const store = (window as any)["store"] = testStore || new Store({
        auth,
        firestore,
        httpsCallable: (name) => httpsCallable(functions, name),
    });

    return (
        <StoreContext.Provider value={store}>
            {children}
        </StoreContext.Provider>
    );
}
