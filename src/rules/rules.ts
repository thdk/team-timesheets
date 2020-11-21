import { IUser, IProject } from "../../common/dist";

const isAdmin = (
    user: IUser | undefined,
) => !!(user && user.roles.admin);

const isUser = (
    user: IUser | undefined,
) => (
        isAdmin(user)
        || isEditor(user)
        || !!(user && user.roles.user)
    );

const isEditor = (
    user: IUser | undefined,
) =>
    (
        isAdmin(user)
        || !!(user && user.roles.editor)
    );

export const canManageTasks = (
    user: IUser | undefined,
) => isAdmin(user);

export const canAddTask = (
    user: IUser | undefined,
) => isAdmin(user);

export const canEditTask = (
    user: IUser | undefined,
) => isAdmin(user);

export const canDeleteTask = (
    user: IUser | undefined,
) => isAdmin(user);

export const canAddProject = (
    user: IUser | undefined,
) => isAdmin(user) || isEditor(user);

export const canEditProject = (
    project: IProject,
    user: IUser | undefined,
    userId: string | undefined,
) =>
    isAdmin(user) ||
    (
        isEditor(user) &&
        userId &&
        userId === project.createdBy
    );

export const canDeleteProject = (
    project: IProject,
    user: IUser | undefined,
    userId: string | undefined,
) => {

    return isAdmin(user) ||
        (
            isEditor(user) &&
            userId && userId === project.createdBy
        );
};

export const canArchiveProject = (
    project: IProject,
    user: IUser | undefined,
    userId: string | undefined,
) => {

    return isAdmin(user) ||
        (
            isEditor(user) &&
            userId && userId === project.createdBy
        );
}

export const canManageProjects = (
    user: IUser | undefined,
) => isAdmin(user) || isEditor(user);

export const canAddClient = (
    user: IUser | undefined,
) => isAdmin(user);

export const canEditClient = (
    user: IUser | undefined,
) => isAdmin(user);

export const canDeleteClient = (
    user: IUser | undefined,
) => isAdmin(user);

export const canWriteClient = (
    user: IUser | undefined,
) => canAddClient(user) && canEditClient(user) && canDeleteClient(user);

export const canManageTeams = (
    user: IUser | undefined,
) => isAdmin(user);

export const canAddTeam = (
    user: IUser | undefined,
) => isAdmin(user);

export const canEditTeam = (
    user: IUser | undefined,
) => isAdmin(user);

export const canDeleteTeam = (
    user: IUser | undefined,
) => isAdmin(user);

export const canReadUsers = (
    user: IUser | undefined,
) => isAdmin(user);

export const canAddRegistrations = (
    user: IUser | undefined,
) => isUser(user);
