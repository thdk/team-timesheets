import { INameWithIcon, INameWithIconData } from "./base";
import { IWithDivision } from "./IWithDivision";

export interface IProject extends INameWithIcon, Partial<IWithDivision> {
    createdBy?: string;
    isArchived?: boolean;
}

export interface IProjectData extends INameWithIconData, IWithDivision {
    createdBy?: string;
    isArchived?: boolean;
}