import * as firebase from "firebase/app";
import "firebase/firestore";
import { config } from "../config";

class Firestorable {
    public readonly firestore: firebase.firestore.Firestore;
    public readonly storage: firebase.storage.Storage;
    public readonly auth: firebase.auth.Auth;

    constructor() {
        firebase.initializeApp({
            apiKey: config.apiKey,
            authDomain: config.authDomain,
            projectId: config.projectId,
            storageBucket: config.storageBucket
        });
        this.firestore = firebase.firestore();
        this.storage = firebase.storage();
        const settings = { timestampsInSnapshots: true };
        this.firestore.settings(settings);

        this.auth = firebase.auth();
    }
}

export const firestorable = new Firestorable();

/**
 * Resolves with firbase.User if user is logged in
 * Rejects if no user is logged in
 */
export const getLoggedInUserAsync = () => {
    return new Promise<firebase.User>((resolve, reject) => {
        const unsubscribe = firebase.auth().onAuthStateChanged(user => {
            unsubscribe();
            if (user) resolve(user);
            else reject("Not authenticated");
        });
    });
}