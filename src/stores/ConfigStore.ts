import { observable, computed } from 'mobx';
import { Collection, ICollection } from "../Firestorable/Collection";
import { IRootStore } from './RootStore';
import { IProject, ITask, IClient } from '../../common/dist';

export interface IConfigStore {
    projects: ICollection<IProject>;
    tasks: ICollection<ITask>;
    clientsCollection: ICollection<IClient>;
    clients: (IClient & {id: string})[];
    taskId?: string;
    projectId?: string;
    clientId?: string;
}

export class ConfigStore implements IConfigStore {
    //private readonly _rootStore: IRootStore;

    readonly projects: ICollection<IProject>;
    readonly tasks: ICollection<IProject>;
    readonly clientsCollection: ICollection<IClient>;

    @observable.ref taskId?: string;
    @observable.ref projectId?: string;
    @observable.ref clientId?: string;

    constructor(_rootStore: IRootStore, getCollection: (name: string) => firebase.firestore.CollectionReference) {
        // this._rootStore = rootStore;
        this.projects = observable(new Collection<IProject>(getCollection.bind(this, "projects"), {
            realtime: true,
            query: ref => ref.orderBy("name")
        }));

        this.tasks = observable(new Collection<ITask>(getCollection.bind(this, "tasks"), {
            realtime: true,
            query: ref => ref.orderBy("name")
        }));

        this.clientsCollection = observable(new Collection<ITask>(getCollection.bind(this, "clients"), {
            realtime: true,
            query: ref => ref.orderBy("name")
        }));
    }

    @computed
    public get clients() {
        return Array.from(this.clientsCollection.docs.values())
            .map(doc => ({ ...doc.data!, id: doc.id }));
    }
}