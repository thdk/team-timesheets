import { INameWithIcon } from "..";

export interface IOrganisation extends INameWithIcon {
    createdBy: string;
    id: string;
}