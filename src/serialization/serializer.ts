import { IRegistrationData, IRegistration } from "../stores/TimesheetsStore";
import * as firebase from 'firebase/app';

export const convertRegistration = (appData: IRegistration) => {
    const registration: IRegistrationData = {
        date: firebase.firestore.Timestamp.fromDate(appData.date),
        description: appData.description,
        project: appData.project,
        task: appData.task,
        time: appData.time,
        userId: appData.userId
    };

    return registration;
}