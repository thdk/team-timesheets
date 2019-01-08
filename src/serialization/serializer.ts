import { IRegistrationData, IRegistration } from "../stores/TimesheetsStore";
import * as firebase from 'firebase/app';
import { IUser, IUserData } from "../stores/UserStore";

export const convertRegistration = (appData: Partial<IRegistration>) => {
    // validation
    if (!appData.date) throw new Error("Regisrations must have a date set.");

    if (!appData.userId) throw new Error("Registrations must have a userId set.");
    // end validation

    const registration: Partial<IRegistrationData> = {
        date: firebase.firestore.Timestamp.fromDate(appData.date),
        description: appData.description,
        project: appData.project,
        task: appData.task,
        time: appData.time,
        userId: appData.userId,
        deleted: appData.deleted
    };

    if (!registration.description) delete registration.description;
    if (!registration.project) delete registration.project;
    if (!registration.deleted) delete registration.deleted;
    if (!registration.time) delete registration.time;

    return registration;
}

export const convertUser = (appData: Partial<IUser>) => {
    const user: IUserData = {
        tasks: appData.tasks ? Array.from(appData.tasks.keys()) : undefined,
        name: appData.name,
        roles: appData.roles,
        defaultTask: appData.defaultTask || ""
    }

    // Todo: automatically remove undefined values for all keys
    if (!user.roles) delete user.roles;
    if (!user.name) delete user.name;
    if (!user.defaultTask) delete user.defaultTask;
    if (!user.tasks) delete user.tasks;

    return user;
}