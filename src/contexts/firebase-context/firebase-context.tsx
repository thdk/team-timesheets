import React, { createContext } from 'react';
import { getApp, initializeApp } from "firebase/app";

import type { FirebaseApp } from "firebase/app";

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
};

export const FirebaseContext = createContext<FirebaseApp>({} as FirebaseApp);
export const FirebaseProvider = ({ children }: React.PropsWithChildren<unknown>) => {
    initializeApp(firebaseConfig);

    return (
        <FirebaseContext.Provider value={getApp()}>
            {children}
        </FirebaseContext.Provider>
    );
}

export const useFirebase = () => React.useContext(FirebaseContext);
