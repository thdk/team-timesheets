import { IRegistrationData, IRegistration } from "../stores/TimesheetsStore";
import * as firebase from 'firebase/app';
import { IUser, IUserData } from "../stores/UserStore";

export const convertRegistration = (appData: Partial<IRegistration> | "delete") => {
    let registration: Partial<IRegistrationData>;
    if (appData === "delete") {
        registration = { deleted: true }
    }
    else {

        // validation
        if (!appData.date) throw new Error("Regisrations must have a date set.");

        if (!appData.userId) throw new Error("Registrations must have a userId set.");
        // end validation

        registration = {
            date: firebase.firestore.Timestamp.fromDate(appData.date),
            description: appData.description,
            project: appData.project,
            task: appData.task,
            time: appData.time,
            userId: appData.userId
        };
    }

    if (undefined === registration.description) delete registration.description;
    if (undefined === registration.project) delete registration.project;
    if (undefined === registration.time) delete registration.time;
    if (undefined === registration.task) delete registration.task;
    if (undefined === registration.client) delete registration.client;

    return registration;
}

export const convertUser = (appData: Partial<IUser>) => {
    const user: IUserData = {
        tasks: appData.tasks ? Array.from(appData.tasks.keys()) : undefined,
        name: appData.name,
        roles: appData.roles,
        defaultTask: appData.defaultTask || "",
        recentProjects: appData.recentProjects
    }

    // Todo: automatically remove undefined values for all keys
    if (!user.roles) delete user.roles;
    if (!user.name) delete user.name;
    if (!user.defaultTask) delete user.defaultTask;
    if (!user.tasks) delete user.tasks;
    if (!user.recentProjects) delete user.recentProjects;

    return user;
}