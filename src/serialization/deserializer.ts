import { IRegistrationData, IRegistration, IUserData, IUser } from "../../common/dist";

export const convertRegistration = (firestoreData: IRegistrationData) => {
    const registration: IRegistration = {
        date: firestoreData.date.toDate(),
        description: firestoreData.description,
        project: firestoreData.project,
        task: firestoreData.task,
        time: firestoreData.time || 0,
        userId: firestoreData.userId,
        client: firestoreData.client,
        isPersisted: true
    };

    return registration;
}

export const convertUser = (firestoreData: IUserData) => {
    const user: IUser = {
        tasks: firestoreData.tasks ? new Map(firestoreData.tasks.map((t): [string, true] => [t, true])) : new Map<string, true>(),
        roles: firestoreData.roles || {},
        name: firestoreData.name || "Unknown time traveller",
        defaultTask: firestoreData.defaultTask,
        recentProjects: firestoreData.recentProjects || [],
        defaultClient: firestoreData.defaultClient || undefined,
        team: firestoreData.team || undefined
    };

    return user;
}