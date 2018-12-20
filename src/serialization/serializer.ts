import { IRegistrationData, IRegistration } from "../stores/TimesheetsStore";
import * as firebase from 'firebase/app';
import { IUser, IUserData } from "../stores/UserStore";

export const convertRegistration = (appData: IRegistration) => {
    const registration: IRegistrationData = {
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

export const convertUser = (appData: IUser) => {
    const user: IUserData = {
        tasks: Array.from(appData.tasks.keys())
    }

    return user;
}