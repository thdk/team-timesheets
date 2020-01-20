import * as firebase from 'firebase/app';
import { IRegistration, IRegistrationData, IUser, IUserData, ITeam, ITeamData, IProject, IProjectData, IFavoriteRegistration } from '../interfaces';
import { INameWithIconData, INameWithIcon } from '../interfaces/base';

export const convertRegistration = (appData: Partial<IRegistration> | null) => {
    let registration: Partial<IRegistrationData>;
    const now = new Date();
    if (appData === null) {
        registration = { deleted: true, modified: firebase.firestore.Timestamp.fromDate(now) };
    }
    else {

        // validation
        if (!appData.date) throw new Error("Registrations must have a date set.");

        if (!appData.userId) throw new Error("Registrations must have a userId set.");
        // end validation

        const description = (appData.description || "").trim();
        registration = {
            date: firebase.firestore.Timestamp.fromDate(appData.date),
            description,
            project: appData.project,
            task: appData.task,
            time: appData.time,
            userId: appData.userId,
            client: appData.client,
            deleted: false,
            modified: firebase.firestore.Timestamp.fromDate(now),
            created: firebase.firestore.Timestamp.fromDate(appData.created || now),
        };
    }

    if (undefined === registration.description) delete registration.description;
    if (undefined === registration.project) delete registration.project;
    if (undefined === registration.time) delete registration.time;
    if (undefined === registration.task) delete registration.task;
    if (undefined === registration.client) delete registration.client;
    if (undefined === registration.created) delete registration.created;
    if (undefined === registration.modified) delete registration.modified;

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
    if (appData === null) {
        throw new Error("Deleting user is not supported");
    }

    const now = new Date();

    const user: Partial<IUserData> = {
        tasks: appData.tasks ? Array.from(appData.tasks.keys()) : undefined,
        name: appData.name,
        roles: appData.roles,
        defaultTask: appData.defaultTask || "",
        recentProjects: appData.recentProjects,
        defaultClient: appData.defaultClient,
        team: appData.team,
        modified: firebase.firestore.Timestamp.fromDate(now),
        created: firebase.firestore.Timestamp.fromDate(appData.created || now),
    }

    // Todo: automatically remove undefined values for all keys
    if (!user.roles) delete user.roles;
    if (!user.name) delete user.name;
    if (!user.defaultTask) delete user.defaultTask;
    if (!user.tasks) delete user.tasks;
    if (!user.recentProjects) delete user.recentProjects;
    if (user.defaultClient === undefined) delete user.defaultClient;
    if (user.team === undefined) delete user.team;

    return user;
}

export function convertTeam(appData: Partial<ITeam>): Partial<ITeamData> {
    return convertNameWithIcon(appData);
}

export function convertProject(appData: Partial<IProject> | null): Partial<IProjectData> {
    let data: Partial<IProjectData>;

    if (appData === null) {
        const now = new Date();
        data = { deleted: true, modified: firebase.firestore.Timestamp.fromDate(now) };
    }
    else {
        data = { ...convertNameWithIcon(appData), createdBy: appData.createdBy, isArchived: appData.isArchived };
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
        data = { deleted: true, modified: firebase.firestore.Timestamp.fromDate(now) };
    }
    else {
        const name = (appData.name || "").trim();
        data = {
            name,
            name_insensitive: name.toUpperCase(),
            icon: appData.icon,
            created: firebase.firestore.Timestamp.fromDate(appData.created || now),
            modified: firebase.firestore.Timestamp.fromDate(now)
        };
    }

    return data;
}