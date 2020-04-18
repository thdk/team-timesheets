import { apps, initializeAdminApp, clearFirestoreData } from "@firebase/testing";

export const initTestFirestore = (projectId: string, collectionNames: string[]) => {
    const app = initializeAdminApp({
        projectId,
    });

    const firestore = app.firestore();

    return {
        refs: collectionNames.map(collectionName => firestore.collection(collectionName)),
        firestore,
        clearFirestoreDataAsync: () => clearFirestoreDataAsync(projectId),
    };
};

export const clearFirestoreDataAsync = (projectId: string) => {
    return clearFirestoreData({ projectId });
};

export const deleteFirebaseAppsAsync = () => {
    return Promise.all(apps().map(app => app.delete()));
};


