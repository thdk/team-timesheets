import * as admin from 'firebase-admin';

export interface IUserData {
    name: string;
    created?: admin.firestore.Timestamp;
    modified?: admin.firestore.Timestamp;
    deleted?: boolean;
}

export interface IDivisionUserData {
    name: string;
    created?: admin.firestore.Timestamp;
    modified?: admin.firestore.Timestamp;
    deleted?: boolean;
}