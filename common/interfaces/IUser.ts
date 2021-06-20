export interface IRoles {
    admin?: boolean;
    user?: boolean;
    editor?: boolean;
    recruit?: boolean;
}

export type RecentlyUsedProjects = string[];

export interface IUser {
    tasks: Map<string, true>;
    roles: IRoles;
    name: string;
    defaultTask?: string;
    recentProjects: RecentlyUsedProjects;
    defaultClient?: string;
    team?: string;
    created?: Date;
    email?: string;
    uid: string;
    divisionId: string;
    divisionUserId?: string;
    numberOfRecentProjects?: number;
}
