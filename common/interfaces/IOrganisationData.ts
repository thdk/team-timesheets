import { INameWithIconData } from "./base";

export interface IOrganisationData extends INameWithIconData {
    createdBy: string;
    id: string;
}