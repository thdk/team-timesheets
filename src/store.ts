import { observable } from 'mobx';
import { Firestorable } from './Firestorable/Firestorable';
import { ICollection, Collection } from './Firestorable/Collection';
import { RouterStore } from 'mobx-router';
import { IViewStore, ViewStore } from './stores/ViewStore';
import { IRegistration, IRegistrationsStore, RegistrationStore } from './stores/TimesheetsStore';
import { IUserStore, UserStore } from './stores/UserStore';
import { IProject, IConfigStore, ConfigStore } from './stores/ConfigStore';

export interface CollectionMap {
    "registrations": IRegistration;
    "tasks": ITask;
    "projects": IProject;
}

export interface ITask {
    name: string;
    icon?: string;
}

const firestorable = new Firestorable();

export interface IRootStore {
    view: IViewStore;
    router: RouterStore;
    timesheets: IRegistrationsStore;
    getCollection: (name: string) => firebase.firestore.CollectionReference;
}

export class Store implements IRootStore {
    readonly tasks: ICollection<ITask>;
    readonly timesheets: IRegistrationsStore;
    readonly view: IViewStore;
    readonly user: IUserStore;
    readonly config: IConfigStore;
    router = new RouterStore();

    public readonly getCollection: (name: string) => firebase.firestore.CollectionReference;

    constructor(getCollection: (name: string) => firebase.firestore.CollectionReference) {
        this.getCollection = getCollection;

        this.tasks = observable(new Collection<ITask>("tasks", getCollection, { realtime: true }));

        this.view = new ViewStore(this);
        this.user = new UserStore(this);
        this.config = new ConfigStore(this, getCollection);
        this.timesheets = new RegistrationStore(this);
        this.loadData();
    }

    loadData() {
        this.tasks.getDocs();
    }
};

const store = (window as any)["store"] = new Store(name => firestorable.firestore.collection(name));

export default store;

