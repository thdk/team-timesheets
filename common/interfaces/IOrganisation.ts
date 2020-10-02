import { INameWithIcon } from "..";

export interface IDivision extends INameWithIcon {
    createdBy: string;
    id: string;
}

export interface IDivisionCode {
    code: string;
    divisionId: string;
}