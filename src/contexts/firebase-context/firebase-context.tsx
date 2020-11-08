import React, { createContext, useState } from 'react';
import * as firebase from "firebase/app";
import { useEffect } from 'react';


export const FirebaseContext = createContext<firebase.app.App>({} as firebase.app.App);
export const FirebaseProvider = ({ children, projectId }: React.PropsWithChildren<{
    projectId?: string
}>) => {
    const [isLoaded, setIsLoaded] = useState(false);
    useEffect(() => {

        fetch('/__/firebase/init.json').then(async response => {
            const config = await response.json();

            firebase.initializeApp(config);
            if (window.location.hostname === 'localhost'
                && window.location.search.indexOf("emulator") !== -1) {
                console.log("testing locally -- hitting local functions and firestore emulators");
                firebase.firestore().settings({
                    host: 'localhost:8080',
                    ssl: false
                });

                firebase.functions().useFunctionsEmulator('http://localhost:5001')
            }

            setIsLoaded(true);
        });


    }, []);

    return isLoaded ?
        (
            <FirebaseContext.Provider value={firebase.app(projectId)}>
                {children}
            </FirebaseContext.Provider>
        )
        : null;
}

export const useFirebase = () => React.useContext(FirebaseContext);
