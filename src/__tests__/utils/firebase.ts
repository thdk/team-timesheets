import fs from "fs";
import path from "path";

import { initializeTestEnvironment } from "@firebase/rules-unit-testing";

export const initTestFirestore = async (
    projectId: string,
    collectionNames: string[],
    auth: { uid: string, email: string },
    pathToRules: string,
) => {    
    const testEnv = await initializeTestEnvironment({
        projectId,
        firestore: {
            rules: fs.readFileSync(path.resolve(__dirname, pathToRules), "utf8")
        }
    }).catch(e => {
        console.error(e);
        throw e;
    });

    const adminTestEnv = await initializeTestEnvironment({
        projectId,
        firestore: {
            rules: fs.readFileSync(path.resolve(__dirname, pathToRules), "utf8")
        }
    }).catch(e => {
        console.error(e);
        throw e;
    });
    
    const adminApp = adminTestEnv.unauthenticatedContext();

    const firestore = adminApp.firestore();
    const firestoreTest = testEnv.authenticatedContext(auth.uid).firestore();

    return {
        refs: collectionNames
            ? collectionNames.map(collectionName => firestore.collection(collectionName))
            : [],
        refsTest: collectionNames && firestoreTest
            ? collectionNames.map(collectionName => firestoreTest.collection(collectionName))
            : [],
        firestore,
        firestoreTest: firestoreTest,
        cleanup: () => Promise.all([
            testEnv.cleanup(),
            adminTestEnv.cleanup(),
        ]),
    };
};
