export interface IRegistration {
    description?: string;
    time?: number;
    project?: string;
    task?: string;
    client?: string;
    date: Date;
    userId: string;
    isPersisted: boolean;
    created?: Date;
    deleted?: boolean;
    source?: string;
    sourceId?: string;
}