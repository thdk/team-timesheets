import * as firebase from "firebase/app";
import "firebase/firestore";
import { config } from "../config";

export class Firestorable {
    public readonly firestore: firebase.firestore.Firestore;

    constructor() {
        firebase.initializeApp({
            apiKey: config.apiKey,
            authDomain: config.authDomain,
            projectId: config.projectId
        });
        this.firestore = firebase.firestore();
        const settings = { timestampsInSnapshots: true };
        this.firestore.settings(settings);
    }
}