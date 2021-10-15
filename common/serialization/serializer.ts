import {
    IRegistration,
    IRegistrationData,
    IUser,
    ITeam,
    ITeamData,
    IProject,
    IProjectData,
    IFavoriteRegistration,
    IDivisionUserData,
    ITaskData,
    ITask,
    IClient,
    IClientData,
    IUserData,
} from '../interfaces';
import { INameWithIconData, INameWithIcon } from '../interfaces/base';
import { IDivision } from '../interfaces/IOrganisation';
import { IDivisionData } from '../interfaces/IOrganisationData';

import { deleteField, FieldValue, Timestamp } from "firebase/firestore";

export const convertRegistration = (appData: Partial<IRegistration> | null) => {
    let registration: Partial<IRegistrationData>;
    const now = new Date();
    if (appData === null) {
        registration = { deleted: true, modified: Timestamp.fromDate(now) };
    }
    else {

        // validation
        if (!appData.date) throw new Error("Registrations must have a date set.");

        if (!appData.userId) throw new Error("Registrations must have a userId set.");
        // end validation

        const description = (appData.description || "").trim();
        registration = {
            date: Timestamp.fromDate(appData.date),
            description,
            project: appData.project,
            task: appData.task,
            time: appData.time,
            userId: appData.userId,
            client: appData.client,
            deleted: false,
            modified: Timestamp.fromDate(now),
            created: Timestamp.fromDate(appData.created || now),
            source: appData.source,
            sourceId: appData.sourceId,
        };
    }

    if (undefined === registration.description) delete registration.description;
    if (undefined === registration.project) delete registration.project;
    if (undefined === registration.time) delete registration.time;
    if (undefined === registration.task) delete registration.task;
    if (undefined === registration.client) delete registration.client;
    if (undefined === registration.created) delete registration.created;
    if (undefined === registration.modified) delete registration.modified;
    if (undefined === registration.source) delete registration.source;
    if (undefined === registration.sourceId) delete registration.sourceId;

    return registration;
}

export const convertFavoriteRegistration = (appData: Partial<IFavoriteRegistration> | null) => {
    let favorite: Partial<IFavoriteRegistration>;
    if (appData === null) {
        throw new Error("You must call delete method to delete a favorite");
    }
    else {

        // validation
        if (!appData.userId) throw new Error("Favorites must have a userId set.");

        const description = (appData.description || "").trim();
        favorite = {
            description,
            project: appData.project,
            task: appData.task,
            time: appData.time,
            userId: appData.userId,
            client: appData.client,
            groupId: appData.groupId,
        };
    }

    if (undefined === favorite.description) delete favorite.description;
    if (undefined === favorite.project) delete favorite.project;
    if (undefined === favorite.time) delete favorite.time;
    if (undefined === favorite.task) delete favorite.task;
    if (undefined === favorite.client) delete favorite.client;

    return favorite;
}

export const convertUser = (appData: Partial<IUser> | null) => {
    let user: Partial<Omit<IDivisionUserData, "divisionId" | "divisionUserId">>
        & Partial<{
            divisionId: string | FieldValue;
            divisionUserId: string | FieldValue;
        }>;
    const now = new Date();
    if (appData === null) {
        user = { deleted: true, modified: Timestamp.fromDate(now) };
    } else {
        user = {
            tasks: appData.tasks ? Array.from(appData.tasks.keys()) : undefined,
            name: appData.name,
            roles: appData.roles,
            defaultTask: appData.defaultTask || "",
            recentProjects: appData.recentProjects,
            defaultClient: appData.defaultClient,
            team: appData.team,
            modified: Timestamp.fromDate(now),
            created: Timestamp.fromDate(appData.created || now),
            uid: appData.uid,
            email: appData.email,
            divisionId: appData.divisionId || "",
            divisionUserId: appData.divisionUserId || deleteField(),
            deleted: false,
            numberOfRecentProjects: appData.numberOfRecentProjects
        }

        // Todo: automatically remove undefined values for all keys
        if (!user.roles) delete user.roles;
        if (!user.name) delete user.name;
        if (!user.name) delete user.name;
        if (!user.defaultTask) delete user.defaultTask;
        if (!user.tasks) delete user.tasks;
        if (!user.recentProjects) delete user.recentProjects;
        if (user.defaultClient === undefined) delete user.defaultClient;
        if (user.team === undefined) delete user.team;
        if (!user.email) delete user.email;
        if (user.numberOfRecentProjects === undefined) delete user.numberOfRecentProjects;
    }

    return user as IUserData;
}

export function convertTeam(appData: Partial<ITeam> | null): Partial<ITeamData> {
    return appData ?
        {
            ...convertNameWithIcon(appData),
            divisionId: appData.divisionId || "",
        } :
        convertNameWithIcon(appData);
}

export function convertTask(appData: Partial<ITask> | null): Partial<ITaskData> {
    return appData ?
        {
            ...convertNameWithIcon(appData),
            divisionId: appData.divisionId || "",
        } :
        convertNameWithIcon(appData);
}

export function convertClient(appData: Partial<IClient> | null): Partial<IClientData> {
    return appData ?
        {
            ...convertNameWithIcon(appData),
            divisionId: appData.divisionId || "",
        } :
        convertNameWithIcon(appData);
}

export function convertDivision(appData: Partial<IDivision> | null): Partial<IDivisionData> {
    let data: Partial<IDivisionData>;

    if (appData === null) {
        const now = new Date();
        data = { deleted: true, modified: Timestamp.fromDate(now) };
    }
    else {
        data = {
            ...convertNameWithIcon(appData),
            createdBy: appData.createdBy,
            id: appData.id,
        };
    }

    if (data.createdBy === undefined) delete (data.createdBy);
    return data;
}
export function convertProject(appData: Partial<IProject> | null): Partial<IProjectData> {
    let data: Partial<IProjectData>;

    if (appData === null) {
        const now = new Date();
        data = { deleted: true, modified: Timestamp.fromDate(now) };
    }
    else {
        data = {
            ...convertNameWithIcon(appData),
            createdBy: appData.createdBy,
            isArchived: appData.isArchived,
            divisionId: appData.divisionId || "",
        };
    }

    if (data.createdBy === undefined) delete (data.createdBy);
    if (data.isArchived === undefined) delete (data.isArchived);
    return data;
}

export function convertNameWithIcon(appData: Partial<INameWithIcon> | null): Partial<INameWithIconData> {
    const now = new Date();

    let data: Partial<INameWithIconData>;

    if (appData === null) {
        const now = new Date();
        data = { deleted: true, modified: Timestamp.fromDate(now) };
    }
    else {
        const name = (appData.name || "").trim();
        data = {
            name,
            name_insensitive: name.toUpperCase(),
            created: Timestamp.fromDate(appData.created || now),
            modified: Timestamp.fromDate(now),
        };

        if (appData.icon) {
            data.icon = appData.icon;
        }
    }

    return data;
}