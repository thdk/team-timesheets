import { IRegistrationData, IRegistration } from "../stores/TimesheetsStore";

export const convertRegistration = (firestoreData: IRegistrationData) => {
    const registration: IRegistration = {
        date: firestoreData.date.toDate(),
        description: firestoreData.description,
        project: firestoreData.project,
        task: firestoreData.task,
        time: firestoreData.time,
        userId: firestoreData.userId
    };

    return registration;
}