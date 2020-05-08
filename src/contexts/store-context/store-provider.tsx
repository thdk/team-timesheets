import React from "react";
import { useFirebase } from "../firebase-context/firebase-context";
import { StoreContext } from "./store-context";
import { Store } from "../../stores/root-store";

export const StoreProvider = ({ children }: React.PropsWithChildren<{}>) => {
    const firebase = useFirebase();

    const auth = firebase.auth();
    const firestore = firebase.firestore();
    const storage = firebase.storage();

    const store = (window as any)["store"] = new Store({
        auth,
        firestore,
        storage,
    });

    return (
        <StoreContext.Provider value={store}>
            {children}
        </StoreContext.Provider>
    );
}
