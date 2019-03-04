import { IRoles, RecentlyUsedProjects } from "./IUser";

export interface IUserData {
    tasks?: string[];
    roles?: IRoles;
    name?: string;
    defaultTask: string;
    defaultClient?: string;
    recentProjects?: RecentlyUsedProjects;
    team?: string;
}