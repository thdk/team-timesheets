import { INameWithIcon, IPersistedEntity, INameWithIconData } from "./base";

export interface IProject extends INameWithIcon {
    createdBy?: string;
}

export interface IProjectData extends INameWithIconData {
    createdBy?: string;
}