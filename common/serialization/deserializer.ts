import { IRegistrationData, IRegistration, IUserData, IUser, ITeamData, ITeam, IProjectData, IProject, ITaskData, ITask } from "../interfaces";
import { INameWithIconData } from "../interfaces/base";


export const convertRegistration = (firestoreData: IRegistrationData) => {
    const registration: IRegistration = {
        date: firestoreData.date.toDate(),
        description: firestoreData.description,
        project: firestoreData.project,
        task: firestoreData.task,
        time: firestoreData.time || 0,
        userId: firestoreData.userId,
        client: firestoreData.client,
        isPersisted: true,
        created: firestoreData.created ? firestoreData.created.toDate() : undefined,
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
        team: firestoreData.team || undefined,
        created: firestoreData.created ? firestoreData.created.toDate() : undefined,
    };

    return user;
}

export const convertTeam = (firestoreData: ITeamData) => {
    return convertNameWithIcon(firestoreData) as ITeam;
}

export const convertProject = (firestoreData: IProjectData) => {
    return convertNameWithIcon(firestoreData) as IProject;
}

export const convertTask = (firestoreData: ITaskData) => {
    return convertNameWithIcon(firestoreData) as ITask;
}

export const convertNameWithIcon = (firestoreData: INameWithIconData) => {
    const data = {
        name: firestoreData.name,
        icon: firestoreData.icon,
        created: firestoreData.created ? firestoreData.created.toDate() : undefined,
    };

    return data;
};