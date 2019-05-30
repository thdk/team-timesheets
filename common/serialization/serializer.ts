import * as firebase from 'firebase/app';
import { IRegistration, IRegistrationData, IUser, IUserData, ITeam, ITeamData, IProject, IProjectData } from '../interfaces';
import { INameWithIconData, INameWithIcon } from '../interfaces/base';

export const convertRegistration = (appData: Partial<IRegistration> | "delete") => {
    let registration: Partial<IRegistrationData>;
    const now = new Date();
    if (appData === "delete") {
        registration = { deleted: true, modified: firebase.firestore.Timestamp.fromDate(now) };
    }
    else {

        // validation
        if (!appData.date) throw new Error("Registrations must have a date set.");

        if (!appData.userId) throw new Error("Registrations must have a userId set.");
        // end validation


        registration = {
            date: firebase.firestore.Timestamp.fromDate(appData.date),
            description: appData.description,
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

export const convertUser = (appData: Partial<IUser>) => {
    const now = new Date();

    const user: IUserData = {
        tasks: appData.tasks ? Array.from(appData.tasks.keys()) : undefined,
        name: appData.name,
        roles: appData.roles,
        defaultTask: appData.defaultTask || "",
        recentProjects: appData.recentProjects,
        defaultClient: appData.defaultClient,
        team: appData.team,
        modified: firebase.firestore.Timestamp.fromDate(now),
        created: firebase.firestore.Timestamp.fromDate(appData.created || now)
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

export function convertProject(appData: Partial<IProject> | "delete"): Partial<IProjectData> {
    if (appData === "delete") throw new Error("Soft 'delete' is not supported for projects. The document must be deleted");

    return { ...convertNameWithIcon(appData), createdBy: appData.createdBy };
}

export function convertNameWithIcon(appData: Partial<INameWithIcon>): Partial<INameWithIconData> {
    const now = new Date();

    const data: Partial<INameWithIconData> = {
        name: (appData.name || "").trim(),
        icon: appData.icon,
        created: firebase.firestore.Timestamp.fromDate(appData.created || now),
        modified: firebase.firestore.Timestamp.fromDate(now)
    };

    return data;
}