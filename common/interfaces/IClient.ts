import { INameWithIcon, INameWithIconData } from "./base";
import { IWithDivision } from "./IWithDivision";

export interface IClient extends INameWithIcon, Partial<IWithDivision> {
}

export interface IClientData extends INameWithIconData, IWithDivision {
}