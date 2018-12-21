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

    return registration;
}

export const convertUser = (appData: Partial<IUser>) => {
    const user: IUserData = {
        tasks: appData.tasks ? Array.from(appData.tasks.keys()) : undefined
    }

    return user;
}