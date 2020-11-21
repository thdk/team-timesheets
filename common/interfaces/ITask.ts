import { INameWithIcon, INameWithIconData } from "./base";
import { IWithDivision } from "./IWithDivision";

export interface ITask extends INameWithIcon, Partial<IWithDivision> {
}

export interface ITaskData extends INameWithIconData, IWithDivision {
}
