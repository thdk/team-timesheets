import React, { createContext } from 'react';
import * as firebase from "firebase/app";

export const FirebaseContext = createContext<firebase.app.App>({} as firebase.app.App);
export const FirebaseProvider = ({ children, projectId }: React.PropsWithChildren<{
    projectId?: string
}>) => {
    return (
        <FirebaseContext.Provider value={firebase.app(projectId)}>
            {children}
        </FirebaseContext.Provider>
    );
}

export const useFirebase = () => React.useContext(FirebaseContext);
