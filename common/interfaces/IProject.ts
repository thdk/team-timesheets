import { INameWithIcon, INameWithIconData } from "./base";

export interface IProject extends INameWithIcon {
    createdBy?: string;
    isArchived?: boolean;
}

export interface IProjectData extends INameWithIconData {
    createdBy?: string;
    isArchived?: boolean;
}