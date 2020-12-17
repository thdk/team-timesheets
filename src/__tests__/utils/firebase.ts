import {
    apps,
    initializeAdminApp,
    initializeTestApp,
    loadFirestoreRules,
} from "@firebase/rules-unit-testing";

const fs = require("fs");
import path from "path";

export const initTestFirestore = (
    projectId: string,
    collectionNames?: string[],
    auth?: { uid: string, email: string },
    pathToRules?: string,
) => {
    if (pathToRules) {
        loadFirestoreRules({
            projectId,
            rules: fs.readFileSync(path.resolve(__dirname, pathToRules), "utf8")
        });
    }

    const testApp = auth
        ? initializeTestApp({
            projectId,
            auth,
        })
        : undefined;

    const adminApp = initializeAdminApp({
        projectId,
    });

    const firestore = adminApp.firestore();
    const firestoreTest = testApp?.firestore();

    return {
        refs: collectionNames
            ? collectionNames.map(collectionName => firestore.collection(collectionName))
            : [],
        refsTest: collectionNames && firestoreTest
            ? collectionNames.map(collectionName => firestoreTest.collection(collectionName))
            : [],
        firestore,
        firestoreTest: firestoreTest,
        testApp,
    };
};

export const deleteFirebaseAppsAsync = () => {
    return Promise.all(apps().map(app => app.delete()));
};
