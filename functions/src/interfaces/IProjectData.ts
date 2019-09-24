import * as admin from 'firebase-admin';

export interface IProjectData {
    name: string;
    icon?: string;
    created?: admin.firestore.Timestamp;
    modified?: admin.firestore.Timestamp;
    createdBy?: string;
    deleted?: boolean;
    isArchived: boolean;
}

export interface IBigQueryProjectData extends Omit<IProjectData, "created" | "modified" | "isArchived"> {
    created: string;
    modified: string;
    importId?: string;
}