import { Timestamp } from "@google-cloud/firestore";

export interface IProjectData {
    name: string;
    icon?: string;
    created?: Timestamp;
    modified?: Timestamp;
    createdBy?: string;
    deleted?: boolean;
    isArchived: boolean;
}

export interface IBigQueryProjectData extends Omit<IProjectData, "created" | "modified" | "isArchived"> {
    created: string;
    modified: string;
    importId?: string;
}