import { IUser, IProject } from "../../common/dist";

const isAdmin = (user?: IUser) => {
    return !!(user && user.roles.admin);
}

const isEditor = (user?: IUser) => {
    return !!(user && user.roles.editor);
}

export const canAddTask = (user?: IUser) => isAdmin(user);
export const canEditTask = (user?: IUser) => isAdmin(user);
export const canDeleteTask = (user?: IUser) => isAdmin(user);

export const canAddProject = (user?: IUser) => isEditor(user);
export const canEditProject = (project: IProject, user?: IUser, userId?: string) => isAdmin(user) || (isEditor(user) && userId && userId === project.createdBy);
export const canDeleteProject = (project: IProject, user?: IUser, userId?: string) => isAdmin(user) || (isEditor(user) && userId && userId === project.createdBy);
export const canArchiveProject = (project: IProject, user?: IUser, userId?: string) => isAdmin(user) || (isEditor(user) && userId && userId === project.createdBy);

export const canAddClient = (user?: IUser) => isAdmin(user);
export const canEditClient = (user?: IUser) => isAdmin(user);
export const canDeleteClient = (user?: IUser) => isAdmin(user);

export const canManageTeams = (user?: IUser) => isAdmin(user);
export const canAddTeam = (user?: IUser) => isAdmin(user);
export const canEditTeam = (user?: IUser) => isAdmin(user);
export const canDeleteTeam = (user?: IUser) => isAdmin(user);

export const canReadUsers = (user?: IUser) => isAdmin(user);