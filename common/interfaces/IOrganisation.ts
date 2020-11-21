import { INameWithIcon } from "..";

export interface IDivision extends Omit<INameWithIcon, "divisionId"> {
    createdBy: string;
    id: string;
}

export interface IDivisionCode {
    code: string;
    divisionId: string;
}