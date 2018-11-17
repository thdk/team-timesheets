import * as firebase from "firebase/app";
import "firebase/firestore";
import { config } from "../config";

export class Firestorable {
    public readonly firestore: firebase.firestore.Firestore;

    constructor() {
        firebase.initializeApp({
            apiKey: config.apiKey,
            authDomain: 'czech-subs-1520975638509.firebaseapp.com',
            projectId: 'czech-subs-1520975638509'
        });
        this.firestore = firebase.firestore();
        const settings = { timestampsInSnapshots: true };
        this.firestore.settings(settings);
    }
}