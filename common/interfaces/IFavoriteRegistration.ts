import { IRegistration } from "./IRegistration";

type IFavoriteRegistrationBase =  Omit<IRegistration, "date"| "isPersisted" | "created" | "deleted">;
export interface IFavoriteRegistration extends IFavoriteRegistrationBase {
    groupId: string;
};
