import { INameWithIcon, INameWithIconData } from "./base";
import { IWithDivision } from "./IWithDivision";

export interface ITeam extends INameWithIcon, IWithDivision {
}

export interface ITeamData extends INameWithIconData, IWithDivision  {}