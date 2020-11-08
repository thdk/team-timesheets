import { Timestamp } from "@firebase/firestore-types";
import { IWithDivision } from "./IWithDivision";

export interface INameWithIcon extends IWithDivision {
    name: string;
    icon?: string;
    created?: Date;
    deleted?: boolean;
}

export interface INameWithIconData extends IPersistedEntity, IWithDivision {
    name: string;
    name_insensitive?: string;
    icon?: string;
    deleted?: boolean;
}

export interface IPersistedEntity {
    created?: Timestamp;
    modified?: Timestamp;
}