import type firebase from "firebase";

export interface INameWithIcon {
    name: string;
    icon?: string;
    created?: Date;
    deleted?: boolean;
}

export interface INameWithIconData extends IPersistedEntity {
    name: string;
    name_insensitive?: string;
    icon?: string;
    deleted?: boolean;
}

export interface IPersistedEntity {
    created?: firebase.firestore.Timestamp;
    modified?: firebase.firestore.Timestamp;
}

export interface IFlaggedForDeletion {
    deleted: boolean;
    modified: firebase.firestore.FieldValue;
}
