import { INameWithIcon, INameWithIconData } from "./base";

export interface IProject extends INameWithIcon {
    organisationId?: string;
    createdBy?: string;
    isArchived?: boolean;
}

export interface IProjectData extends INameWithIconData {
    organisationId?: string;
    createdBy?: string;
    isArchived?: boolean;
}