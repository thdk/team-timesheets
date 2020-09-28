import { IRoles, RecentlyUsedProjects } from "./IUser";
import { IPersistedEntity } from "./base";

export interface IUserData extends IPersistedEntity {
    tasks?: string[];
    roles?: IRoles;
    name?: string;
    defaultTask?: string;
    defaultClient?: string;
    recentProjects?: RecentlyUsedProjects;
    team?: string;
    email?: string;
    uid?: string;
    divisionId?: string;
    divisionUserId?: string;
}