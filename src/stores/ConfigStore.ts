import { observable } from 'mobx';
import { Collection, ICollection } from "../Firestorable/Collection";
import { IRootStore } from './RootStore';

export interface IConfigStore {
    projects: ICollection<IProject>;
    tasks: ICollection<ITask>;
    taskId?: string;
    projectId?: string;
}

export interface IProject {
    name: string;
    icon?: string;
}

export interface ITask {
    name: string;
    icon?: string;
}

export class ConfigStore implements IConfigStore {
    //private readonly _rootStore: IRootStore;

    readonly projects: ICollection<IProject>;
    readonly tasks: ICollection<IProject>;

    @observable.ref taskId?: string;
    @observable.ref projectId?: string;

    constructor(_rootStore: IRootStore, getCollection: (name: string) => firebase.firestore.CollectionReference) {
        // this._rootStore = rootStore;
        this.projects = observable(new Collection<IProject>(getCollection.bind(this, "projects"), { realtime: true }));
        this.tasks = observable(new Collection<ITask>(getCollection.bind(this, "tasks"), { realtime: true }));
        this.projects.getDocs();
        this.tasks.getDocs();
    }
}