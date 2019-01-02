import { IRegistrationData, IRegistration } from "../stores/TimesheetsStore";
import { IUser, IUserData } from "../stores/UserStore";

export const convertRegistration = (firestoreData: IRegistrationData) => {
    const registration: IRegistration = {
        date: firestoreData.date.toDate(),
        description: firestoreData.description,
        project: firestoreData.project,
        task: firestoreData.task,
        time: firestoreData.time,
        userId: firestoreData.userId,
        deleted: firestoreData.deleted
    };

    return registration;
}

export const convertUser = (firestoreData: IUserData) => {
    const registration: IUser = {
        tasks: firestoreData.tasks ? new Map(firestoreData.tasks.map((t): [string, true] => [t, true])) : new Map<string, true>(),
        roles: firestoreData.roles || {},
        name: firestoreData.name || "Unknown time traveller"
    };

    return registration;
}