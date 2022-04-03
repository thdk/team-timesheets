import * as admin from 'firebase-admin';

export interface IClientData {
    name: string;
    created?: admin.firestore.Timestamp;
    modified?: admin.firestore.Timestamp;
    deleted?: boolean;
    divisionId: string;
}

export interface IBigQueryClientData extends Omit<IClientData, "created" | "modified"> {
    created: string;
    modified: string;
}