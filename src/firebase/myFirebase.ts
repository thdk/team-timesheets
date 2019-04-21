import "firebase/firestore";
import * as firebase from "firebase/app";
import { config } from "../config";

const app = firebase.initializeApp({
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    storageBucket: config.storageBucket
});

export const firestore = app.firestore();
export const storage = app.storage();
export const auth = app.auth();
export const functions = app.functions();