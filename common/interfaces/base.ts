import { Timestamp } from "@firebase/firestore-types";

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
    created?: Timestamp;
    modified?: Timestamp;
}