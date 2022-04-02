import * as admin from 'firebase-admin';

export interface ITaskData {
    name: string;
    icon?: string;
    created?: admin.firestore.Timestamp;
    modified?: admin.firestore.Timestamp;
    deleted?: boolean;
    divisionId: string;
}

export interface IBigQueryTaskData extends Omit<ITaskData, "created" | "modified"> {
    created: string;
    modified: string;
}